<script>
  import { onMount } from "svelte";
  import { username, setGameState, connectServer } from "./game.js";

  export let size;
  let inp;
  let error = false;

  function play() {
    console.log($username.length, $username.length > 0 && $username.length < 22);
    if ($username.length > 0 && $username.length < 22) {
      error = false;
      connectServer();
    } else {
      error = true;
    }
  }

  onMount(() => {
    inp.focus();
  });
</script>

<img class="logo" src="./images/logo_new.png" alt="log" />
<div class={size}>
  <p align="justify">
    A new board is released every day on which <span class="highlight">four players</span> cooperate
    to create as many words as possible in <span class="higlight">90 seconds.</span>
    Each player works in their own <span class="highlight">4x4 area</span>
    rearranging by <span class="highlight">swapping adjacent</span> letters.
  </p>

  <div class="instruction-img">
    <img src="images/swapping_transparent.gif" alt="swapping letters" />
  </div>

  <p align="justify">
    Players should try to connect their words with others to make the long words possible, as points
    scale exponentially. If this is your first time to play please <a
      href="/"
      on:click|preventDefault={() => {
        setGameState("rules");
      }}><b>read the rules first</b>,</a
    > otherwise pick your username (1-21 characters) and play!
  </p>
</div>
<form on:submit={play}>
  <input
    placeholder="Username"
    minlength="1"
    maxlength="21"
    bind:this={inp}
    bind:value={$username}
  />
  <button on:click|preventDefault={play}>Play</button>
</form>

{#if error}
  <div style="color: #ee110f; margin-top: 10px;">Username must be 1-21 characters long.</div>
{/if}

<style>
  .instruction-img {
    margin: 8px;
  }

  button {
    font-family: "Alfa Slab One", cursive;
  }

  .highlight {
    font-weight: 800;
    color: #1974d2;
  }

  .slogan {
    font-size: 22px;
    font-family: "Alfa Slab One", cursive;
    color: #1972d2;
  }
</style>
