import { writable, get } from "svelte/store";
import { getQuadrant, updateBoard } from "./boardHelpers";
import { getStartingBoard } from "./createBoard";

export const gameState = writable("disconnected");
export const boardUpdate = writable([]);
export const board = writable("");
export const quadrant = writable(1);
export const gameID = writable("");
export const users = writable(["", "", "", ""]);
export const username = writable("");
export const userIDs = writable([]);
export const userID = writable([]);
export const finalWords = writable([]);
export const finalScore = writable();
export const userCount = writable(0);
export const gameTimerStart = writable();
export const gameTimerProgress = writable();
export const connectionUrl = writable("localhost:3080");

let socket = null;

export function setGameState(value) {
  gameState.set(value);
}

function setUsersLocations(data) {
  let orderedUsers = [];
  let existingUsers = data["users"];
  let quads = data["quadrants"];
  let ids = data["user_ids"];

  for (let i = 0; i < existingUsers.length; i++) {
    orderedUsers[quads[i] - 1] = existingUsers[i];
    if (ids[i] == get(userID)) {
      quadrant.set(quads[i]);
    }
  }
  users.set(orderedUsers);
  userIDs.set(data["user_ids"]);
}

async function runTimer() {
  let elapsed = performance.now() - get(gameTimerStart);
  gameTimerProgress.set((elapsed / 1000 / 90.5) * 100);
}

function startGame(op, data) {
  setUsersLocations(data);
  gameID.set(data["game_id"]);
  let startingBoard = getStartingBoard(get(quadrant), data);
  board.set(startingBoard);
  gameState.set(op);
  gameTimerStart.set(performance.now());
  setInterval(runTimer, 200);
}

function selectCell(data) {
  let row = data.row;
  let col = data.col;
  let id = row * 8 + col;
  let selectedQuadrant = getQuadrant(row, col);
  if (selectedQuadrant == get(quadrant)) {
    return;
  }
  let tempBoard = get(board);
  for (let i = 0; i < tempBoard.length; i++) {
    if (tempBoard[i].quadrant == selectedQuadrant) {
      tempBoard[i].selected = false;
    }
  }
  tempBoard[id].selected = true;
  board.set(tempBoard);
}

export function finishGame(op, data) {
  let wordsByLength = [[], [], [], [], [], []];
  data["words"].forEach(function (word) {
    wordsByLength[8 - word.length].push(word);
  });
  finalWords.set(wordsByLength);
  finalScore.set(data["score"]);
  gameState.set(op);
}

export function connectServer() {
  let connectString = "ws://" + get(connectionUrl) + `/connect?user=${get(username)}`;
  // let connectString = "wss://" + get(connectionUrl) + `/connect?user=${get(username)}`;
  socket = new WebSocket(connectString);

  socket.addEventListener("open", function (event) {
    gameState.set("waiting");
  });

  socket.addEventListener("message", function (event) {
    let msg = JSON.parse(event.data);
    if ("op" in msg) {
      let op = msg.op;
      let data = msg.data;

      switch (op) {
        case "abort-game":
          gameState.set("abort-game");
          break;
        case "finish-game":
          finishGame(op, data);
          break;
        case "select":
          selectCell(data);
          break;
        case "start-countdown":
          gameState.set("start-countdown");
          break;
        case "start-game":
          startGame(op, data);
          break;
        case "update-board-on-swap":
          board.set(updateBoard(data, get(board), get(quadrant)));
          break;
        case "user-count":
          userCount.set(data["count"]);
          break;
        case "user-join":
          userID.set(data["user_id"]);
          break;
      }
    }
  });
}

export const sendMessage = message => {
  if (socket.readyState <= 1) {
    socket.send(message);
  }
};
