use crate::database::Database;
use actix::prelude::Actor;
use actix::prelude::Context;

impl Actor for Database {
    type Context = Context<Self>;

    // Upon starting it will set the day to ready for games
    // being saved or the day's game being retrieved.
    fn started(&mut self, ctx: &mut Self::Context) {
        self.update_day(ctx);
    }
}
