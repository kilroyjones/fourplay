use crate::server::Server;
use actix::prelude::Message;
use actix::Addr;
use serde::Serialize;
use std::sync::Arc;
use uuid::Uuid;

#[derive(Message)]
#[rtype(result = "()")]
pub struct DatabaseAddGame {
    pub game_id: Uuid,
    pub player1: String,
    pub player2: String,
    pub player3: String,
    pub player4: String,
    pub score: u32,
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct DatabaseConnect {
    pub server: Arc<Addr<Server>>,
}

#[derive(Message)]
#[rtype(result = "Result<String, ()>")]
pub struct DatabaseGetGame {
    pub year: u32,
    pub month: u8,
    pub day: u8,
}

#[derive(Message)]
#[rtype(result = "Result<String, ()>")]
pub struct DatabaseGetWinners {
    pub day: u8,
    pub month: u8,
    pub year: u32,
}

#[derive(Debug, Serialize)]
pub struct GameRecord {
    pub year: u32,
    pub month: u32,
    pub day: u32,
    pub player1: String,
    pub player2: String,
    pub player3: String,
    pub player4: String,
}

impl Message for GameRecord {
    type Result = Option<GameRecord>;
}
