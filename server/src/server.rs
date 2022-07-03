/**
 * The Server actor maintains the following:
 *  - A connection to the Users actor
 *  - The user_state, as in if they are in a game or not.  
 *  - Look up all existing games
 *
 */
use crate::database::Database;
use crate::game::Game;
use crate::messages::database_messages::DatabaseConnect;
use crate::messages::game_messages::{GameJoin, GameLeave};
use crate::messages::server_messages::{ServerConnect, ServerDisconnect};
use crate::messages::websocket_messages::WebSocketMessage;
use actix::prelude::{Actor, Context, Recipient};
use actix::Addr;
use actix::{fut, ActorContext, ActorFuture, AsyncContext, ContextFutureSpawner, WrapFuture};
use log::{error, info};
use std::collections::{HashMap, HashSet};
use std::fs::File;
use std::io::{prelude::*, BufReader};
use std::sync::Arc;
use uuid::Uuid;

#[derive(Debug)]
pub struct GameData {
    /// Used by the server actor to store the connection information to actor that
    /// that was spun up.
    pub user_count: u32,
    pub addr: Arc<Addr<Game>>,
    pub is_started: bool,
}

#[derive(Debug)]
pub struct Server {
    /// The server actor is the central authority, storing all games and users. It also
    /// maintains a connection to the database, as well as storing the day's current
    /// game and a reference to the wordlist. This wordlist reference is passed to each
    /// game on its creation.
    pub games: HashMap<Uuid, GameData>,
    pub database: Arc<Addr<Database>>,
    pub users: HashMap<Uuid, User>,
    pub current_game: Uuid,
    pub daily_board: String,
    pub wordlist: Arc<HashSet<String>>,
}

#[derive(Debug, Clone)]
pub struct User {
    /// Used by the server actor to store the user's connection information.
    pub id: Uuid,
    pub username: String,
    pub game_id: Uuid,
    pub addr: Arc<Recipient<WebSocketMessage>>,
}

/// Helper function used by the server actor to create the word list.
pub fn get_wordlist() -> HashSet<String> {
    let file = File::open("wordlist.txt").unwrap();
    let reader = BufReader::new(file);
    let mut wordlist = HashSet::new();
    for word in reader.lines() {
        let mut word = word.unwrap();
        word.pop();
        wordlist.insert(word);
    }
    wordlist
}

impl Server {
    pub async fn new(database: Arc<Addr<Database>>) -> Server {
        let wordlist = get_wordlist();
        let server = Server {
            games: HashMap::new(),
            database: Arc::clone(&database),
            users: HashMap::new(),
            current_game: Uuid::new_v4(),
            daily_board: "".into(),
            wordlist: Arc::new(wordlist),
        };
        server
    }

    /// Adds a user to the server as well as sends a message to the current_game
    /// to add the user.
    pub fn add_user(&mut self, msg: ServerConnect) {
        let mut username: String = msg
            .username
            .replace(&['(', ')', ',', '\"', '.', ';', ':', '\''][..], "");
        if username.len() > 21 {
            username = username.split_off(21);
        }
        let user = User {
            id: msg.id,
            username: username.clone(),
            game_id: self.current_game.clone(),
            addr: Arc::new(msg.addr),
        };
        self.users.insert(user.id, user);
        let user = self.users.get(&msg.id).unwrap();

        match self.games.get_mut(&self.current_game) {
            Some(game) => {
                game.addr.do_send(GameJoin {
                    user_id: user.id,
                    username: user.username.clone(),
                    addr: Arc::clone(&user.addr),
                });
            }
            None => return,
        };
    }

    /// Upon starting the server actor this function should be called and
    /// passed the context of the server. It then connects to the database
    /// actor, throwing and error and stopping it unable to do so.
    pub fn connect_database(&mut self, ctx: &mut Context<Self>) {
        self.database
            .send(DatabaseConnect {
                server: Arc::new(ctx.address()),
            })
            .into_actor(self)
            .then(|res, _, ctx| {
                match res {
                    Ok(_res) => (),
                    _ => {
                        error!("Unable to connect to the database in the server actor");
                        ctx.stop()
                    }
                }
                fut::ready(())
            })
            .wait(ctx);
    }

    /// Removes the user from server and sends a message to the game actor
    /// to remove the user from that as well.
    pub fn remove_user(&mut self, msg: ServerDisconnect) {
        let user = match self.users.get(&msg.user_id) {
            Some(user) => user,
            None => {
                error!("Can't remove user, user {} not found", msg.user_id);
                return;
            }
        };

        match self.games.get_mut(&user.game_id) {
            Some(game) => {
                if game.user_count > 0 {
                    game.user_count -= 1;
                }
                game.addr.do_send(GameLeave { user_id: user.id });
            }
            None => {
                error!(
                    "Can't send remove user from game, game {} not found",
                    user.game_id
                );
            }
        };
        self.users.remove(&msg.user_id);
    }

    /// Check to see if there is a game currently waiting for people to join.
    /// If the user count is less than 4, it will return the id of the current game,
    /// otherwise it calls the start_new_game function and returns that id.
    pub fn set_current_game(&mut self, ctx: &mut Context<Self>) -> Uuid {
        match self.games.get(&self.current_game) {
            Some(game) => {
                info!(
                    "Current waiting game {} user count:  {}",
                    self.current_game, game.user_count
                );
                if !game.is_started {
                    return self.current_game;
                }
            }
            None => {
                error!("Current waiting game {} not found", self.current_game);
            }
        }
        let id = self.start_new_game(ctx);
        info!("New game started: {} ", id);
        id
    }

    /// This function will be called upon a user connecting to the server. It
    /// creates and starts and new game actor, waiting for more players to connect.  
    /// It keeps track of the game actor's address and number of players. When four
    /// players are found, the game itself will start.
    fn start_new_game(&mut self, ctx: &mut Context<Self>) -> Uuid {
        info!(
            "Starting a new game. Currently {} games running",
            self.games.len()
        );

        let id = Uuid::new_v4();
        let game = Game::new(
            id,
            ctx.address(),
            self.daily_board.clone(),
            Arc::clone(&self.database),
            Arc::clone(&self.wordlist),
        )
        .start();

        let addr = Arc::new(game);
        let game_data = GameData {
            user_count: 0,
            addr: Arc::clone(&addr),
            is_started: false,
        };

        self.games.insert(id, game_data);
        self.current_game = id;
        id
    }
}
