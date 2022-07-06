mod board;
mod database;
mod game;
mod routes;
mod server;
mod websocket;

mod actors {
    pub mod database_actor;
    pub mod game_actor;
    pub mod server_actor;
    pub mod websocket_actor;
}

mod handlers {
    pub mod database_handlers;
    pub mod game_handlers;
    pub mod server_handlers;
    pub mod websocket_handlers;
}

mod messages {
    pub mod database_messages;
    pub mod game_messages;
    pub mod server_messages;
    pub mod websocket_messages;
}

use actix;
use actix::Actor;
use actix_cors::Cors;
use actix_web::{App, HttpServer};
use database::Database;
use dotenv::dotenv;
use log::info;
use routes::{connect, winners};
use server::Server;
use sqlx::SqlitePool;
use std::env;
use std::sync::Arc;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init();
    info!("Starting the server");
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL not set");
    let pool = SqlitePool::builder()
        .max_size(5)
        .build(database_url.as_str())
        .await
        .unwrap();

    let database = Database::new(pool.clone()).await;
    let database_addr = database.start();
    let server = Server::new(Arc::new(database_addr.clone())).await;
    let server_addr = server.start();

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);
        App::new()
            .wrap(cors)
            .data(server_addr.clone())
            .data(pool.clone())
            .service(connect)
            .service(winners)
    })
    .bind("127.0.0.1:3080")?
    .run()
    .await
}
