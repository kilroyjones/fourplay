use actix::prelude::Message;
use serde::Serialize;
use serde_json::Value;

#[derive(Message, Serialize)]
#[rtype(result = "()")]
pub struct WebSocketMessage {
    pub op: String,
    pub data: Value,
}
