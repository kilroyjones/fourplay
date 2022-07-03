<script>
  import { setGameState } from "../game";
  export let size;
  export let words;
  export let score;

  let countHeaderColors = ["#ff007f", "#55ff44", "#08e8de", "#ffaa1d", "#1974d2", "#44ca77"];
</script>

<img class="logo" src="./images/logo_new.png" alt="log" />
<div class={size}>
  <div class="title">Words found</div>
  <hr />
  {#each words as wordSet, i}
    {#if wordSet.length > 0}
      <div class="outer-container">
        <div class="count-header" style="background-color:{countHeaderColors[i]}">{8 - i}</div>
        <div class="words-container">
          {#each wordSet as word}
            <div class="word">{word}</div>
          {/each}
        </div>
      </div>
    {/if}
  {/each}
  <hr />
  <div class="score">Score: <span class="color-num">{score}</span></div>
</div>

<button on:click|preventDefault={() => setGameState("disconnected")}>Again?</button>

<style>
  button {
    max-width: 300px;
  }
  .title {
    font-family: "Alfa Slab One", cursive;
    font-size: 2em;
    margin-bottom: 0.1em;
  }

  .outer-container {
    min-width: 100%;
    max-width: 100%;
    display: flex;
    margin-bottom: 10px;
  }

  .words-container {
    display: flex;
    flex: 90%;
    flex-wrap: wrap;
    align-items: flex-start;
    margin-bottom: 10px;
  }

  .count-header {
    flex: 10%;
    width: 20px;
    height: 40px;
    font-family: "Alfa Slab One", cursive;
    text-align: center;
    font-size: 1.3em;
    border-radius: 5px;
    padding: 4px;
    padding-left: 8px;
    padding-right: 8px;
    color: white;
    margin: 3px;
  }

  hr {
    border-color: #1974d2;
    width: 100%;
    /* max-width: 450px; */
  }

  .word {
    font-size: 18px;
    margin: 5px;
    align-self: center;
  }

  .score {
    font-family: "Alfa Slab One", cursive;
    white-space: nowrap;
    font-size: 1.5em;
  }

  .color-num {
    color: #1974d2;
  }

  button {
    font-family: "Alfa Slab One", cursive;
  }
</style>
