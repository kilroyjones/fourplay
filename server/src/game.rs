use crate::board::Board;
/**
 * The Game actor maintains the state of a single running game. Messages are routed via the
 * Server actor and then processed here.
 */
use crate::database::Database;
use crate::messages::database_messages::DatabaseAddGame;
use crate::messages::game_messages::{
    GameAborted, GameBoardSetupJson, GameBoardStateResponse, GameJoinJson, GameResultJson,
    GameUserCount,
};
use crate::messages::server_messages::{ServerEndGame, ServerJoinGame};
use crate::messages::websocket_messages::WebSocketMessage;
use crate::server::Server;
use actix::prelude::{Context, Recipient};
use actix::{ActorContext, Addr, AsyncContext};
use log::{debug, error};
use rand::seq::SliceRandom;
use rand::thread_rng;
use serde_json;
use std::collections::HashSet;
use std::sync::Arc;
use std::time::{Duration, Instant};
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct User {
    /// Stores the user's game quadrant. The addr for the user is that of the
    /// websocket, which was passed view the websocket actor -> server actor ->
    /// game actor (here).
    pub username: String,
    pub id: Uuid,
    pub quadrant: u8,
    pub addr: Arc<Recipient<WebSocketMessage>>,
}

#[derive(Debug)]
pub struct Game {
    /// Stores the game state, with a link back to the server actor, as well as a
    /// link to the database and a reference of the wordlist passed from the server
    /// actor.
    pub id: Uuid,
    pub server: Addr<Server>,
    pub users: Vec<User>,
    pub board: Board,
    pub is_started: bool,
    pub database: Arc<Addr<Database>>,
    pub wordlist: Arc<HashSet<String>>,
    pub score: u32,
    pub game_start_time: Instant,
}

impl Game {
    pub fn new(
        id: Uuid,
        addr: Addr<Server>,
        board: String,
        database: Arc<Addr<Database>>,
        wordlist: Arc<HashSet<String>>,
    ) -> Game {
        Game {
            id: id,
            server: addr,
            users: Vec::new(),
            board: Board::new(board),
            database: database,
            is_started: false,
            wordlist: wordlist,
            score: 0,
            game_start_time: Instant::now(),
        }
    }

    pub fn add_user(&mut self, id: Uuid, username: String, addr: Arc<Recipient<WebSocketMessage>>) {
        // fix username dupe issue by appending a number that is stripped off when displaying
        // on the user end?
        // let username = self.get_username(username);
        self.users.push(User {
            id: id,
            quadrant: 0,
            username: username.clone(),
            addr: Arc::clone(&addr),
        });

        debug!("Users currently in game: {:?}", self.users);
        let user_join = serde_json::to_value(GameJoinJson {
            username: username,
            user_id: id,
        })
        .unwrap();

        let _ = addr.do_send(WebSocketMessage {
            op: "user-join".into(),
            data: user_join,
        });

        self.server.do_send(ServerJoinGame { game_id: self.id });
        self.update_user_count();
    }

    pub fn abort_game(&mut self, ctx: &mut Context<Self>) {
        let game_aborted = serde_json::to_value(GameAborted {
            reason: "Player left before".into(),
        })
        .unwrap();
        self.broadcast("abort-game".into(), game_aborted);
        self.server.do_send(ServerEndGame { game_id: self.id });
        ctx.stop();
    }

    pub fn broadcast(&mut self, op: String, data: serde_json::Value) {
        debug!("Broadcasting {} to user {:?}", op, self.users);
        for user in self.users.iter() {
            let _ = user.addr.do_send(WebSocketMessage {
                op: op.clone(),
                data: data.clone(),
            });
        }
    }

    pub fn calculate_score(&mut self) -> serde_json::value::Value {
        let mut score: u32 = 0;
        let mut words_found: Vec<String> = Vec::new();
        let board = self.board.get_board_as_2d_array();

        for row in 0..8 {
            for col in 0..8 {
                for i in (col + 1)..7 {
                    let c = String::from_iter(&board[row][col..i + 2]);
                    if self.wordlist.contains(&c.to_lowercase()) {
                        score += (2 as u32).pow(c.len() as u32 - 3);
                        words_found.push(c.clone());
                    }
                }

                for i in (row + 1)..7 {
                    let c: String = board[row..i + 2].iter().map(|s| &s[col]).collect();
                    if self.wordlist.contains(&c.to_lowercase()) {
                        score += (2 as u32).pow(c.len() as u32 - 3);
                        words_found.push(c.clone());
                    }
                }
            }
        }

        self.score = score;
        serde_json::to_value(GameResultJson {
            score: score,
            words: words_found,
        })
        .unwrap()
    }
    pub fn assign_quadrants(&mut self) {
        let mut quadrants: Vec<u8> = (1..5).collect();
        quadrants.shuffle(&mut thread_rng());
        for user in self.users.iter_mut() {
            user.quadrant = quadrants.pop().unwrap();
        }
    }

    pub fn finish_game(&mut self, ctx: &mut Context<Self>) {
        self.game_start_time = Instant::now();
        ctx.run_later(Duration::from_secs(93), |act, ctx| {
            debug!("Game has finished: {} {}", act.id, act.is_started);
            if act.users.len() == 4 {
                let game_result = act.calculate_score();
                act.database.do_send(DatabaseAddGame {
                    game_id: act.id,
                    player1: act.users[0].username.clone(),
                    player2: act.users[1].username.clone(),
                    player3: act.users[2].username.clone(),
                    player4: act.users[3].username.clone(),
                    score: act.score,
                });
                act.broadcast("finish-game".into(), game_result.clone());
                act.server.do_send(ServerEndGame { game_id: act.id });
                ctx.stop();
            }
        });
    }
    pub fn remove_user(&mut self, id: Uuid) {
        debug!("Removing user from game {}", self.id);
        self.users.retain(|user| user.id != id);
        debug!("Users currently in game: {:?}", self.users);
    }

    pub fn start_game(&mut self, ctx: &mut Context<Self>) {
        self.broadcast("start-countdown".into(), "".into());
        self.assign_quadrants();
        let board = self.board.board.clone();
        ctx.run_later(Duration::from_secs(3), move |act, ctx| {
            if act.users.len() == 4 {
                act.is_started = true;
                let board_setup = serde_json::to_value(GameBoardSetupJson {
                    game_id: act.id.clone(),
                    users: vec![
                        act.users[0].username.clone(),
                        act.users[1].username.clone(),
                        act.users[2].username.clone(),
                        act.users[3].username.clone(),
                    ],
                    user_ids: vec![
                        act.users[0].id.clone(),
                        act.users[1].id.clone(),
                        act.users[2].id.clone(),
                        act.users[3].id.clone(),
                    ],
                    quadrants: vec![
                        act.users[0].quadrant,
                        act.users[1].quadrant,
                        act.users[2].quadrant,
                        act.users[3].quadrant,
                    ],
                    board: board.into(),
                })
                .unwrap();
                act.broadcast("start-game".into(), board_setup);
            } else {
                act.broadcast("start-cancelled".into(), "".into());
                act.abort_game(ctx);
            }
            return;
        });
    }

    pub fn update_user_count(&mut self) {
        let user_count = serde_json::to_value(GameUserCount {
            count: self.users.len(),
        })
        .unwrap();
        self.broadcast("user-count".into(), user_count);
    }

    pub fn update_board_on_swap(&mut self, row1: u8, col1: u8, row2: u8, col2: u8) {
        let board = serde_json::to_value(GameBoardStateResponse {
            board: self.board.board.clone().into(),
            row1: row1,
            col1: col1,
            row2: row2,
            col2: col2,
        })
        .unwrap();
        debug!("UPDATE ON SWAP {:?}", board);
        self.broadcast("update-board-on-swap".into(), board);
    }
}
