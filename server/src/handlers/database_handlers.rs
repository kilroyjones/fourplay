use crate::database::Database;
use crate::messages::database_messages::{DatabaseAddGame, DatabaseConnect};
use actix::prelude::*;
use actix::prelude::{Context, Handler};
use chrono::Datelike;
use log::info;
use std::sync::Arc;

impl Handler<DatabaseAddGame> for Database {
    type Result = ();
    fn handle(&mut self, msg: DatabaseAddGame, ctx: &mut Context<Self>) -> Self::Result {
        info!("Adding to database");
        let pool = self.pool.clone();
        let current_date = chrono::Utc::now();
        let year = current_date.year();
        let month = current_date.month();
        let day = current_date.day();

        // async block is required due to non-async context
        async move {
            let conn = pool.acquire().await.unwrap();
            let query = format!(
                "INSERT INTO played_games (year, month, day, player1, player2, player3, player4, score) VALUES ({}, {}, {},'{}','{}','{}','{}',{});",
                year, month, day, msg.player1, msg.player2, msg.player3, msg.player4, msg.score
            );
            let res = sqlx::query(&query).execute(conn).await;
            info!("{:?}", res);
        }
        .into_actor(self)
        .wait(ctx);
    }
}

impl Handler<DatabaseConnect> for Database {
    type Result = ();
    fn handle(&mut self, msg: DatabaseConnect, ctx: &mut Context<Self>) -> Self::Result {
        info!("Connected server to database");
        self.server = Some(Arc::clone(&msg.server));
        self.send_server_todays_game(ctx);
    }
}
