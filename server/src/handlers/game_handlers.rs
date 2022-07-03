use crate::game::Game;
use crate::messages::game_messages::*;
use crate::messages::websocket_messages::WebSocketMessage;
use actix::prelude::{Context, Handler};
use log::{debug, error};
use serde_json;

// Checks if the number of users has reached game limit and then fire
// off the game if it has, otherwise just broadcast join.
impl Handler<GameJoin> for Game {
    type Result = ();
    fn handle(&mut self, msg: GameJoin, ctx: &mut Context<Self>) {
        if self.users.len() < 4 {
            debug!("User joining game: {} / {}", msg.username, msg.user_id);
            self.add_user(msg.user_id, msg.username.clone(), msg.addr);
        }

        if self.users.len() == 4 {
            debug!("Game {} is starting", self.id);
            self.start_game(ctx);
            self.finish_game(ctx);
        }
    }
}

// When a user leaves check if there are any remaining players, otherwise
// abort the game.
impl Handler<GameLeave> for Game {
    type Result = ();
    fn handle(&mut self, msg: GameLeave, ctx: &mut Context<Self>) {
        debug!("User leaving game {}: {}", self.id, &msg.user_id);
        self.remove_user(msg.user_id);
        if !self.is_started && self.users.len() == 0 {
            debug!("Game is ending {}", self.id);
            self.abort_game(ctx);
        }
    }
}

// There are only two game events: select and swap. Here we deserialize the event data
// and then match either of these. Probably should break these out into other functions,
// but with only two events, it's not necessary at this point.
// TODO
//  - [ ] - Check if the swap event was within the user space
impl Handler<GameEvent> for Game {
    type Result = ();
    fn handle(&mut self, msg: GameEvent, _: &mut Context<Self>) {
        debug!("GameEvent in game actor: {}", &msg.event);
        let event: GameEvents = match serde_json::from_str(&msg.event.to_string()) {
            Ok(event) => event,
            Err(_) => {
                error!("Invalid GameEvent {}", msg.event.to_string());
                return;
            }
        };

        match event {
            GameEvents::Swap {
                row1,
                col1,
                row2,
                col2,
            } => {
                let user = match self.users.iter().find(|u| u.id == msg.user_id) {
                    Some(user) => user,
                    None => {
                        error!("User not found [GameEvents swap]");
                        return;
                    }
                };
                let res = self.board.play(user.quadrant, row1, col1, row2, col2);
                if !res {
                    let _ = user.addr.do_send(WebSocketMessage {
                        op: "error".into(),
                        data: "Invalid move".into(),
                    });
                }
                self.update_board_on_swap(row1, col1, row2, col2);
            }
            GameEvents::Select { row, col } => {
                debug!("Selected {}-{}", row, col);
                // Check if the select is in the user's space. This shouldn't cause a problem because
                // it's checked on the user side, but if functionality changes, then maybe.
                let select = serde_json::to_value(GameSelectSquare { row: row, col: col }).unwrap();
                self.broadcast("select".into(), select);
            }
        }
    }
}
