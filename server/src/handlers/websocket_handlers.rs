/*
 * Handlers for the WebSocket actor.
 *
 * There are only two handlers needed, with one processing WebSocketMessages which are outgoing
 * messages to the client (json), and the other processing incoming messages and then parsing them
 * before sending them on to the Server actor.
 *
 */
use crate::messages::game_messages::GameEvent;
use crate::messages::server_messages::ServerJsonMessage;
use crate::messages::websocket_messages::WebSocketMessage;
use crate::websocket::WebSocket;
use actix::prelude::Handler;
use actix::StreamHandler;
use actix_web_actors::ws;
use log::debug;
use std::time::Instant;

// This Handler is used for messages to the client. The WebSocketMessage is a tuple which only
// contains a string.
impl Handler<WebSocketMessage> for WebSocket {
    type Result = ();
    fn handle(&mut self, msg: WebSocketMessage, ctx: &mut Self::Context) {
        let serialized = serde_json::to_string(&msg).unwrap();
        debug!("MSG Sent: {}", serialized);
        ctx.text(serialized);
    }
}

// This Handler deals with the streaming websocket data. It's responsible for updating the
// heartbeat time on each ping/pong as well as processing incoming user data for sending on
// to the Server actor.
impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for WebSocket {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Ping(msg)) => {
                self.heartbeat_time = Instant::now();
                ctx.pong(&msg);
            }

            Ok(ws::Message::Pong(_)) => {
                self.heartbeat_time = Instant::now();
            }

            Ok(ws::Message::Text(text)) => {
                let data = text.as_ref();
                let msg: ServerJsonMessage = serde_json::from_str(data).unwrap();
                debug!("MSG Received: User {} / Data: {}", self.username, data);

                match msg {
                    ServerJsonMessage::GameEvent { game_id, event } => {
                        self.server.do_send(GameEvent {
                            user_id: self.id,
                            game_id: game_id,
                            event: event,
                        })
                    }
                }
            }

            Ok(ws::Message::Binary(bin)) => ctx.binary(bin),
            _ => (),
        }
    }
}
