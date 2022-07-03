use crate::messages::server_messages::ServerUpdateCurrentGame;
use crate::server::Server;
use actix::prelude::*;
use actix::Addr;
use chrono::Datelike;
use log::debug;
use sqlx::SqlitePool;
use std::sync::Arc;
use std::time::Duration;

#[derive(Debug)]
pub struct Database {
    pub pool: SqlitePool,
    pub server: Option<Arc<Addr<Server>>>,
    pub day: u32,
}

impl Database {
    pub async fn new(pool: SqlitePool) -> Database {
        let current_date = chrono::Utc::now();
        let day = current_date.day();

        Database {
            pool: pool,
            server: None,
            day: day,
        }
    }

    pub fn send_server_todays_game(&mut self, ctx: &mut Context<Self>) {
        let pool = self.pool.clone();
        let server = Arc::clone(&self.server.as_ref().unwrap());

        async move {
            let mut conn = pool.acquire().await.unwrap();
            let current_date = chrono::Utc::now();
            let year = current_date.year();
            let month = current_date.month();
            let day = current_date.day();
            let result = sqlx::query!(
                "SELECT * FROM game WHERE year=? AND month=? AND day=?",
                year,
                month as i32,
                day as i32
            )
            .fetch_one(&mut conn)
            .await;
            let board = result.unwrap().board.unwrap();
            server.do_send(ServerUpdateCurrentGame {
                board: board.into(),
            })
        }
        .into_actor(self)
        .wait(ctx);
    }

    pub fn update_day(&mut self, ctx: &mut Context<Self>) {
        debug!("Starting the stuff");
        ctx.run_interval(Duration::from_secs(60), |act, ctx| {
            debug!("Testing...");
            let current_date = chrono::Utc::now();
            let day = current_date.day();
            if day != act.day {
                act.send_server_todays_game(ctx);
            }
        });
    }
}
