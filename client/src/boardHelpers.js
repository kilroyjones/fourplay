export function getQuadrant(row, col) {
  if (row < 4 && col < 4) {
    return 1;
  } else if (row < 4 && col > 3) {
    return 2;
  } else if (row > 3 && col < 4) {
    return 3;
  } else if (row > 3 && col > 3) {
    return 4;
  }
}

function getSwap(row, col, currentRow, currentCol) {
  if (Math.abs(row - currentRow) == 1 && col == currentCol) {
    return ["flipVerticalCurrent", "flipVerticalPrevious"];
  } else if (row == currentRow && Math.abs(col - currentCol) == 1) {
    return ["flipHorizontalCurrent", "flipHorizontalPrevious"];
  }
  return "none";
}

function setAnimations(currentBoard, row1, col1, row2, col2, quadrant) {
  let idx1 = row1 * 8 + col1;
  let idx2 = row2 * 8 + col2;
  let swap = getSwap(row1, col1, row2, col2);
  currentBoard[idx1].animationDirection = swap[0];
  currentBoard[idx2].animationDirection = swap[1];
  return currentBoard;
}

export function updateBoard(data, currentBoard) {
  let newBoard = data.board;
  for (let i = 0; i < newBoard.length; i++) {
    currentBoard[i].letter = newBoard[i];
  }

  if (getQuadrant(data.row1, data.col1) != quadrant) {
    currentBoard = setAnimations(currentBoard, data.row1, data.col1, data.row2, data.col2);
  }
  return currentBoard;
}
