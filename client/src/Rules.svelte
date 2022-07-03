<script>
  export let size;
</script>

<div style="width:100%" class="centered-container">
  <img class="logo" src="./images/logo_new.png" alt="log" />

  <div class={size}>
    <div class="title">Rules</div>
    <p align="justify">
      <span class="highlight">Four players</span> cooperate to create as many words as possible.
      Each player has their own <span class="highlight">4x4 area, and moves by </span>
      <span class="highlight">swapping adjacent</span> letters.
    </p>

    <div class="instruction-img-mobile">
      <img src="images/swapping_transparent.gif" alt="swapping letters" />
    </div>
    <p align="justify">
      The goal is to work together to create longer words, as points scale exponentially with
      length, with the minimum length being <span class="highlight">three</span>. That means an
      8-letter word is 32 points.
    </p>
    <div>
      <span class="points">1.</span>
      <span class="points">2.</span>
      <span class="points">4.</span>
      <span class="points">8.</span>
      <span class="points">16.</span>
      <span class="points">32.</span>
    </div>
    <p align="justify">
      Make words left to right and top to bottom, trying to connect across to other player areas
    </p>
    <div class="instruction-img-mobile">
      <img src="images/instructions-mobile.png" alt="swapping letters" />
    </div>
    <p align="justify">The top ten teams of the day will be displayed.</p>
  </div>
</div>

<style>
  .title {
    font-size: 28px;
    font-weight: 800;
    color: #1972d2;
    margin-top: 1em;
    margin-bottom: 1em;
  }

  .points {
    font-size: 1.5em;
    font-family: "Alfa Slab One", cursive;
    color: #1974d2;
  }

  .instruction-img {
    width: 95%;
    margin: 8px;
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
