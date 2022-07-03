/**
 * The WebSocket module is used to maintain the connection between the user and the server.
 *
 * Description
 *  When a user connects a websocket is created within main.rs and it's passed the address of the
 *  the server actor, along with username of the user. This actor has a heartbeat function which
 *  pings the user and will kill the actor if no response is given.
 *
 * TODO
 *  [x] - Use IDs
 *  [ ] - Set config for heartbeat via environment variable
 */
use crate::server::Server;
use actix::{ActorContext, Addr, AsyncContext};
use actix_web_actors::ws;
use log::info;
use std::time::{Duration, Instant};
use uuid::Uuid;

pub struct WebSocket {
    pub id: Uuid,
    pub username: String,
    pub ip: String,
    pub server: Addr<Server>,
    pub heartbeat_time: Instant,
}

impl WebSocket {
    pub fn new(username: String, server: Addr<Server>, ip: String) -> WebSocket {
        info!("WebSocket created");
        WebSocket {
            id: Uuid::new_v4(),
            username: username,
            ip: ip,
            server: server,
            heartbeat_time: Instant::now(),
        }
    }

    pub fn heartbeat(&self, ctx: &mut ws::WebsocketContext<Self>) {
        ctx.run_interval(Duration::from_secs(5), |act, ctx| {
            if Instant::now().duration_since(act.heartbeat_time) > Duration::from_secs(10) {
                ctx.stop();
                return;
            }
            ctx.ping(b"ping");
        });
    }
}
