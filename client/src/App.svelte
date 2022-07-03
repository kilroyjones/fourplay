<script>
  import { gameState, finalScore, finalWords, setGameState } from "./game.js";
  import Finish from "./Play/Finish.svelte";
  import Winners from "./Scoreboard/Winners.svelte";
  import Rules from "./Rules.svelte";
  import Home from "./Home.svelte";
  import Starting from "./Play/Starting.svelte";
  import MediaQuery from "svelte-media-query";
  import Waiting from "./Play/Waiting.svelte";
  import Game from "./Play/Game.svelte";
</script>

<MediaQuery query="(max-width:480px)" let:matches>
  {#if matches}
    <ul class="mobile">
      <li>
        <a class="active" href="/"><img src="images/logo_new.png" width="110px" alt="home" /></a>
      </li>
      <li>
        <a class="active" href="/" on:click|preventDefault={() => setGameState("disconnected")}
          >play</a
        >
      </li>

      <li>
        <a class="active" href="/" on:click|preventDefault={() => setGameState("rules")}>rules</a>
      </li>

      <li>
        <a class="active" href="/" on:click|preventDefault={() => setGameState("winners")}
          >winners</a
        >
      </li>
    </ul>
  {/if}
</MediaQuery>

<MediaQuery query="(min-width: 481px)" let:matches>
  {#if matches}
    <ul class="not-mobile">
      <li>
        <a class="active" href="/"><img src="images/logo_new.png" width="210px" alt="home" /></a>
      </li>

      <li>
        <a class="active" href="/" on:click|preventDefault={() => setGameState("disconnected")}
          >play</a
        >
      </li>

      <li>
        <a class="active" href="/" on:click|preventDefault={() => setGameState("rules")}>rules</a>
      </li>

      <li>
        <a class="active" href="/" on:click|preventDefault={() => setGameState("winners")}
          >winners</a
        >
      </li>
    </ul>
  {/if}
</MediaQuery>

<MediaQuery query="(min-width: 481px)" let:matches>
  {#if matches}
    <div class="centered-container">
      {#if $gameState == "disconnected"}
        <Home size={"desktop"} />
      {:else if $gameState == "waiting"}
        <Waiting size={"desktop"} />
      {:else if $gameState == "start-countdown"}
        <Starting />
      {:else if $gameState == "rules"}
        <Rules size={"desktop"} />
      {:else if $gameState == "winners"}
        <Winners size={"desktop"} />
      {:else if $gameState == "abort-game"}
        Game was aborted!
      {:else if $gameState == "finish-game"}
        <Finish size={"desktop"} words={$finalWords} score={$finalScore} />
      {/if}
    </div>
  {/if}
</MediaQuery>

<MediaQuery query="(max-width:480px)" let:matches>
  {#if matches}
    <div class="centered-container">
      {#if $gameState == "disconnected"}
        <Home size={"mobile"} />
      {:else if $gameState == "waiting"}
        <Waiting size={"mobile"} />
      {:else if $gameState == "start-countdown"}
        <Starting />
      {:else if $gameState == "rules"}
        <Rules size={"mobile"} />
      {:else if $gameState == "winners"}
        <Winners size={"mobile"} />
      {:else if $gameState == "abort-game"}
        Game was aborted!
      {:else if $gameState == "finish-game"}
        <Finish size={"mobile"} words={$finalWords} score={$finalScore} />
      {/if}
    </div>
  {/if}
</MediaQuery>

{#if $gameState == "start-game"}
  <Game />
{/if}

<!-- <Finish
  words={[
    "test",
    "test",
    "teasda",
    "teasdf",
    "teasdf",
    "teasdf",
    "teasdf",
    "teasdf",
    "teasdf",
    "teast",
  ]}
  score={145}
/> -->
<style>
  a,
  a:active {
    font-family: "Alfa Slab One", cursive;
    color: #1974d2;
  }

  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  li {
    float: left;
  }

  li a {
    display: block;
    text-align: center;
    padding: 10px 9px;
    text-decoration: none;
  }

  .not-mobile {
    font-size: 2.3em;
  }

  .mobile {
    font-size: 1.2em;
  }

  li a:hover {
    color: #fcb95d;
  }
</style>
