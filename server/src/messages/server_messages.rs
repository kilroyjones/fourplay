use crate::messages::websocket_messages::WebSocketMessage;
use actix::prelude::{Message, Recipient};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Message)]
#[rtype(result = "()")]
pub struct ServerConnect {
    pub id: Uuid,
    pub username: String,
    pub ip: String,
    pub addr: Recipient<WebSocketMessage>,
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct ServerDisconnect {
    pub addr: Recipient<WebSocketMessage>,
    pub user_id: Uuid,
    pub username: String,
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct ServerJoinGame {
    pub game_id: Uuid,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "op")]
pub enum ServerJsonMessage {
    #[serde(rename = "game-event")]
    GameEvent { game_id: Uuid, event: String },
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct ServerEndGame {
    pub game_id: Uuid,
}

#[derive(Message, Debug)]
#[rtype(result = "()")]
pub struct ServerUpdateCurrentGame {
    pub board: String,
}
