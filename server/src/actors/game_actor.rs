use crate::game::Game;
use actix::prelude::Actor;
use actix::prelude::Context;
use actix::Running;
use log::debug;

impl Actor for Game {
    type Context = Context<Self>;

    fn stopping(&mut self, _: &mut Self::Context) -> Running {
        debug!("Stopping game actor: {}", self.id);
        Running::Stop
    }
}
