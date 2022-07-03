<script>
  export let listing;
</script>

{#each listing as day, i}
  <div class="outer-container">
    {#if i == 0}
      <div class="score">
        <img class="score-img" src="images/first.png" alt="first place" width="40px" />
        ({day.score})
      </div>
    {:else if i == 1}
      <div class="score">
        <img class="score-img" src="images/second.png" alt="second place" width="40px" />
        ({day.score})
      </div>
    {:else if i == 2}
      <div class="score">
        <img class="score-img" src="images/third.png" alt="third place" width="40px" />
        ({day.score})
      </div>
    {:else}
      <div class="score">
        <img class="score-img" src="images/runner.png" alt="third place" width="40px" />
        ({day.score})
      </div>
    {/if}

    <div class="players-container">
      <div class="player">{day.player1}</div>
      <div class="player">{day.player2}</div>
      <div class="player">{day.player3}</div>
      <div class="player">{day.player4}</div>
    </div>
  </div>
{/each}

<style>
  .outer-container {
    min-width: 100%;
    max-width: 100%;
    display: flex;
    margin-bottom: 10px;
  }

  .players-container {
    display: flex;
    flex: 70%;
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .score {
    flex: 25%;
    max-width: 120px;
    padding: 5px;
    align-self: center;
    color: #1972d2;
    font-family: "Alfa Slab One", cursive;
    font-size: 1em;
    margin-bottom: 16px;
  }

  .score-img {
    margin-right: 8px;
  }

  .player {
    padding: 6px;
    font-size: 20px;
    color: #1972d2;
  }

  .score {
    display: flex;
    align-items: center;
    font-weight: 800;
    font-size: 22px;
  }
</style>
