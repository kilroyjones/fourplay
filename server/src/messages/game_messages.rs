use crate::messages::websocket_messages::WebSocketMessage;
use actix::prelude::{Message, Recipient};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

#[derive(Debug, Serialize)]
pub struct GameAborted {
    pub reason: String,
}

#[derive(Debug, Serialize)]
pub struct GameBoardSetupJson {
    pub game_id: Uuid,
    pub users: Vec<String>,
    pub user_ids: Vec<Uuid>,
    pub quadrants: Vec<u8>,
    pub board: String,
}

#[derive(Debug, Serialize)]
pub struct GameBoardStateResponse {
    pub board: String,
    pub row1: u8,
    pub col1: u8,
    pub row2: u8,
    pub col2: u8,
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct GameEvent {
    pub user_id: Uuid,
    pub game_id: Uuid,
    pub event: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "op")]
pub enum GameEvents {
    #[serde(rename = "swap")]
    Swap {
        row1: u8,
        col1: u8,
        row2: u8,
        col2: u8,
    },

    #[serde(rename = "select")]
    Select { row: u8, col: u8 },
}

#[derive(Message, Debug)]
#[rtype(result = "()")]
pub struct GameJoin {
    pub user_id: Uuid,
    pub username: String,
    pub addr: Arc<Recipient<WebSocketMessage>>,
}

#[derive(Debug, Serialize)]
pub struct GameJoinJson {
    pub username: String,
    pub user_id: Uuid,
}

#[derive(Message, Debug)]
#[rtype(result = "()")]
pub struct GameLeave {
    pub user_id: Uuid,
}

#[derive(Debug, Serialize)]
pub struct GameResultJson {
    pub score: u32,
    pub words: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct GameSelectSquare {
    pub row: u8,
    pub col: u8,
}

#[derive(Debug, Serialize)]
pub struct GameUserCount {
    pub count: usize,
}
