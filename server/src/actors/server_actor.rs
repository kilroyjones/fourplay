use crate::server::Server;
use actix::prelude::Actor;
use actix::Context;

impl Actor for Server {
    type Context = Context<Self>;

    // Upon starting the actor it will pass it's context to the database actor,
    // allowing the db actor to send it messages as need be.
    fn started(&mut self, ctx: &mut Self::Context) {
        self.connect_database(ctx);
    }
}
