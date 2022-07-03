/**
 * This is the WebSocket actor setup.
 *
 * Currently, it only handles the starting and stopping of the actor.
 *
 * TODO
 *  [ ] - Implement start/stop in order to perform more specific tasks on connect
 *        and disconnection.
 */
use crate::messages::server_messages::{ServerConnect, ServerDisconnect};
use crate::websocket::WebSocket;
use actix::prelude::Actor;
use actix::{
    fut, ActorContext, ActorFuture, AsyncContext, ContextFutureSpawner, Running, WrapFuture,
};
use actix_web_actors::ws;
use log::debug;

impl Actor for WebSocket {
    type Context = ws::WebsocketContext<Self>;

    // Initialize the heartbeat (see: websocket.rs) and connect to the
    // server actor. If we're unable to connect, shutdown the connection.
    fn started(&mut self, ctx: &mut Self::Context) {
        debug!("Starting the websocket actor {}", self.id);
        self.heartbeat(ctx);
        let addr = ctx.address();

        self.server
            .send(ServerConnect {
                id: self.id,
                username: self.username.clone(),
                ip: self.ip.clone(),
                addr: addr.recipient(),
            })
            .into_actor(self)
            .then(|res, _, ctx| {
                match res {
                    Ok(_res) => (),
                    _ => ctx.stop(),
                }
                fut::ready(())
            })
            .wait(ctx);
    }

    // Upon losing the websocket connection, the server actor is sent a message so
    // it can clean up user information.
    fn stopping(&mut self, ctx: &mut Self::Context) -> Running {
        debug!("Stopping the websocket actor {}", self.id);
        let addr = ctx.address();
        self.server.do_send(ServerDisconnect {
            addr: addr.recipient(),
            user_id: self.id,
            username: self.username.clone(),
        });
        Running::Stop
    }
}
