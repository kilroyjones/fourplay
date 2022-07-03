<script>
  import { onMount } from "svelte";
  import Cell from "./Cell.svelte";
  import { getQuadrant } from "../boardHelpers";
  import { gameTimerProgress, users, board, quadrant, gameID, sendMessage } from "../game";

  let windowWidth;
  let size = 50;
  let buffer = 8;
  let maxBuffer = 8;
  let offset;
  let currentSelected = -1;

  function resizeBoard() {
    if ($board) {
      offset = (windowWidth - 8 * (size + buffer)) / 2 - buffer / 2;
      if (windowWidth > 500) {
        size = 50 + (20 * windowWidth) / 2000;
        buffer = maxBuffer;
        offset -= (buffer * 8) / 2;
      } else if ($board) {
        size = (windowWidth / 500) * 50;
        buffer = (windowWidth / 500) * maxBuffer;
      }
      for (let i = 0; i < $board.length; i++) {
        $board[i].x = $board[i].col * (size + buffer);
        $board[i].y = $board[i].row * (size + buffer);
      }
      $board = $board;
    }
  }

  function getSwap(row, col) {
    let currentRow = $board[currentSelected].row;
    let currentCol = $board[currentSelected].col;
    if (Math.abs(row - currentRow) == 1 && col == currentCol) {
      return ["flipVerticalCurrent", "flipVerticalPrevious"];
    } else if (row == currentRow && Math.abs(col - currentCol) == 1) {
      return ["flipHorizontalCurrent", "flipHorizontalPrevious"];
    }
    return "none";
  }

  function sendSelect(id) {
    let event = {
      op: "select",
      row: $board[id].row,
      col: $board[id].col,
    };
    let msg = { op: "game-event", game_id: $gameID, event: JSON.stringify(event) };
    msg = JSON.stringify(msg);
    sendMessage(msg);
  }

  function sendSwap(idx1, idx2) {
    let event = {
      op: "swap",
      row1: $board[idx1].row,
      col1: $board[idx1].col,
      row2: $board[idx2].row,
      col2: $board[idx2].col,
    };
    let msg = { op: "game-event", game_id: $gameID, event: JSON.stringify(event) };
    msg = JSON.stringify(msg);
    sendMessage(msg);
  }

  function setSelected(id) {
    $board[id].selected = true;
    sendSelect(id);

    if (currentSelected != -1) {
      $board[currentSelected].selected = false;
    }
    if ($board[id].selected) {
      currentSelected = id;
    } else {
      currentSelected = -1;
    }
  }

  function selectCell(id) {
    let row = $board[id].row;
    let col = $board[id].col;
    let swap = "none";
    if (getQuadrant(row, col) != $quadrant) {
      return;
    }

    if (currentSelected != -1) {
      swap = getSwap(row, col);
      $board[currentSelected].animationDirection = swap[0];
      $board[id].animationDirection = swap[1];
      if (swap != "none") {
        let temp = $board[currentSelected].letter;
        $board[currentSelected].letter = $board[id].letter;
        $board[id].letter = temp;
        sendSwap(id, currentSelected);
      }
    }

    setSelected(id);
  }

  onMount(() => {
    resizeBoard();
  });

  function update() {
    $board = $board;
  }
  $: windowWidth, resizeBoard();
  $: $board, update();
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div id="progressbar" style="position: relative; margin-left: {offset}px" class="wrapper">
  {#if $gameTimerProgress >= 0}
    <progress style="width: {size * 8 + buffer * 7}px" value={100 - $gameTimerProgress} max="100" />
  {/if}
</div>
<div style="position: relative; margin-left: {offset}px" class="wrapper">
  <div class="name" style="color: #05b008; position:absolute; top: -36px;">{$users[0]}</div>
  <div
    class="name"
    style="color: #ffaa1d; position:absolute; top: -36px; left: {size * 4 + buffer * 4}px"
  >
    {$users[1]}
  </div>
</div>
<div style="margin-left: {offset}px" class="wrapper">
  {#if $board}
    {#each $board as square, i}
      <Cell
        id={square.id}
        x={square.x}
        y={square.y}
        {size}
        color={square.color}
        letter={square.letter}
        selected={square.selected ? "selected" : ""}
        animationDirection={square.animationDirection}
        {selectCell}
      />
    {/each}
  {/if}
</div>
<div
  style="position: relative; margin-left: {offset}px; margin-top: {60 +
    size * 8 +
    buffer * 8 +
    20}px"
>
  <div class="name" style="color: #1974d1; position:absolute; top: -20px;">{$users[2]}</div>
  <div
    class="name"
    style="color: #ff007f; position:absolute; top: -20px; left: {size * 4 + buffer * 4}px"
  >
    {$users[3]}
  </div>
</div>

<style>
  progress {
    border-radius: 7px;
    width: 80%;
    height: 26px;
  }

  progress::-webkit-progress-bar {
    background-color: #ffaa1d;
    border-radius: 7px;
  }
  progress::-webkit-progress-value {
    background-color: #1974d2;
    border-radius: 7px;
  }

  progress::-moz-progress-bar {
    background-color: #1974d2;
    border-radius: 7px;
  }

  .wrapper {
    margin-top: 60px;
  }

  .name {
    font-family: "Alfa Slab One", cursive;
    font-size: 22px;
  }
</style>
