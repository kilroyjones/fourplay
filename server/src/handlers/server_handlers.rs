use crate::messages::game_messages::GameEvent;
use crate::messages::server_messages::*;
use crate::messages::websocket_messages::WebSocketMessage;
use crate::server::Server;
use actix::prelude::{Context, Handler};
use log::{debug, warn};

// Connects a user's websocket to the server actor.
// Checks for duplicate ids first. Not really necessary at this point, but later if the
// id is used for something else aside from server-side identifying of the user, then
// it may be necessary.
impl Handler<ServerConnect> for Server {
    type Result = ();
    fn handle(&mut self, msg: ServerConnect, ctx: &mut Context<Self>) -> Self::Result {
        debug!("User connection to server: {}", &msg.username);
        if self.users.contains_key(&msg.id) {
            let _ = msg.addr.do_send(WebSocketMessage {
                op: "connection-refused".into(),
                data: "User already exists.".into(),
            });
        }
        self.set_current_game(ctx);
        self.add_user(msg);
    }
}

impl Handler<ServerDisconnect> for Server {
    type Result = ();
    fn handle(&mut self, msg: ServerDisconnect, _: &mut Context<Self>) {
        debug!("User disconnected from server: {}", &msg.username);
        self.remove_user(msg);
    }
}

// The game actor messages the server a confirmation at this handle and the
// server maintains a user count for the awaiting game so that it can know
// when to spin up another one.
impl Handler<ServerJoinGame> for Server {
    type Result = ();
    fn handle(&mut self, msg: ServerJoinGame, _: &mut Context<Self>) {
        debug!("User joined game: {}", msg.game_id);
        match self.games.get_mut(&msg.game_id) {
            Some(game) => {
                game.user_count += 1;
                if game.user_count == 4 {
                    game.is_started = true;
                }
            }
            None => warn!("Game not found by server"),
        }
    }
}

// When the game ends or is aborted by the game actor this handler will receive
// a message and remove it from the server listing.
impl Handler<ServerEndGame> for Server {
    type Result = ();
    fn handle(&mut self, msg: ServerEndGame, _: &mut Context<Self>) {
        debug!(
            "Removing game {} from list of {} games",
            &msg.game_id,
            self.games.len()
        );
        self.games.remove(&msg.game_id);
        debug!("Game removed, {} games remaining", self.games.len());
    }
}

// Passes on game events to the correct game.
impl Handler<GameEvent> for Server {
    type Result = ();
    fn handle(&mut self, msg: GameEvent, _: &mut Context<Self>) {
        match self.games.get(&msg.game_id) {
            Some(game) => game.addr.do_send(msg),
            None => warn!("Game not found by server"),
        }
    }
}

// The database actor will send a message to the server actor every 24hrs to
// update the current game.
impl Handler<ServerUpdateCurrentGame> for Server {
    type Result = ();
    fn handle(&mut self, msg: ServerUpdateCurrentGame, _: &mut Context<Self>) {
        debug!("Board updated {}", msg.board);
        self.daily_board = msg.board;
    }
}
