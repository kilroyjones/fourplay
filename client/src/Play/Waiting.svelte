<script>
  import { userCount } from "../game.js";

  export let size;
</script>

<img class="logo" src="./images/logo_new.png" alt="log" />
<div class={size}>
  <div class="title">Finding players...</div>
  <img src="images/waiting.svg" width="150px" alt="loading" />
  <div class="player-count">Found: {$userCount}</div>
</div>

<style>
  .title {
    font-size: 2em;
    font-family: "Alfa Slab One", cursive;
    margin-bottom: 1em;
  }

  .player-count {
    font-family: "Alfa Slab One", cursive;
    font-size: 1.5em;
    margin-top: 1.5em;
  }
</style>
