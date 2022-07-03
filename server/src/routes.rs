use crate::server::Server;
use crate::websocket::WebSocket;
use actix;
use actix::Addr;
use actix_web::HttpRequest;
use actix_web::{get, web, Error, HttpResponse, Responder, Result};
use actix_web_actors::ws;
use chrono::{Datelike, Duration};
use log::{error, info};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;

#[derive(Debug, Deserialize)]
pub struct ConnectionParams {
    user: String,
}

#[derive(Debug, Serialize)]
pub struct Winners {
    pub year: i32,
    pub month: i32,
    pub day: i32,
    pub player1: String,
    pub player2: String,
    pub player3: String,
    pub player4: String,
    pub score: i32,
}

#[derive(Debug, Serialize)]
pub struct Days {
    pub today: Vec<Winners>,
    pub yesterday: Vec<Winners>,
}

#[get("/winners")]
pub async fn winners(pool: web::Data<SqlitePool>) -> impl Responder {
    let mut conn = pool.acquire().await.unwrap();
    let current_date = chrono::Utc::now();
    let year = current_date.year();
    let month = current_date.month();
    let day = current_date.day();

    let today = sqlx::query_as!(Winners,
                "SELECT * FROM played_games WHERE year=? AND month=? AND day=? ORDER BY score DESC LIMIT 10;",
                year as i32,
                month as i32,
                day as i32
            )
            .fetch_all(&mut conn)
            .await;

    let current_date = chrono::Utc::now() - Duration::days(1);
    let year = current_date.year();
    let month = current_date.month();
    let day = current_date.day();

    let yesterday = sqlx::query_as!(Winners,
                "SELECT * FROM played_games WHERE year=? AND month=? AND day=? ORDER BY score DESC LIMIT 10;",
                year as i32,
                month as i32,
                day as i32
            )
            .fetch_all(&mut conn)
            .await;

    let results = Days {
        today: today.unwrap(),
        yesterday: yesterday.unwrap(),
    };
    return web::Json(results);
}

#[get("/connect")]
pub async fn connect(
    server: web::Data<Addr<Server>>,
    stream: web::Payload,
    req: HttpRequest,
) -> Result<HttpResponse, Error> {
    let params = match web::Query::<ConnectionParams>::from_query(req.query_string()) {
        Ok(params) => params,
        Err(_) => {
            error!("No user name provided in request");
            return Ok(HttpResponse::Ok().body("Error connecting"));
        }
    };

    info!("Establishing websocket connection for user {}", params.user);

    let web_socket = WebSocket::new(
        params.user.to_owned(),
        server.get_ref().clone(),
        req.connection_info().remote_addr().unwrap().to_string(),
    );
    let response = ws::start(web_socket, &req, stream)?;
    Ok(response)
}
