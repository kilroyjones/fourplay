import { getQuadrant } from "./boardHelpers";

class Square {
  constructor(id, row, col, x, y, quadrant, color, size, letter) {
    this.id = id;
    this.row = row;
    this.col = col;
    this.x = x;
    this.y = y;
    this.quadrant = quadrant;
    this.color = color;
    this.size = size;
    this.letter = letter;
    this.selected = false;
    this.animationDirection = "none";
  }
}

export function getStartingBoard(quadrant, data) {
  let rows = 8;
  let cols = 8;
  let size = 50;
  let buffer = 8;
  let count = 0;
  let color = "isNotPlayerQuadrant";
  let letters = data["board"];
  let startingBoard = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let letter = letters[count];
      let x = col * (size + buffer);
      let y = row * (size + buffer);
      let currentQuadrant = getQuadrant(row, col);
      if (currentQuadrant == quadrant) {
        color = "isPlayerQuadrant";
      } else {
        color = "isNotPlayerQuadrant";
      }
      let cell = new Square(count, row, col, x, y, currentQuadrant, color, size, letter);
      startingBoard.push(cell);
      count += 1;
    }
  }
  return startingBoard;
}
