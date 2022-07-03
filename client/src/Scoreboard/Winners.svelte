<script>
  import { onMount } from "svelte";
  import { connectionUrl } from "../game";
  import WinnerListing from "./WinnerListing.svelte";
  export let size;
  let today = [];
  let yesterday = [];

  onMount(async () => {
    const response = await fetch("https://" + $connectionUrl + "/winners", {
      method: "GET",
    });

    if (response.status === 200) {
      const data = await response.json();
      today = data.today;
      yesterday = data.yesterday;
    } else {
      throw new Error(response.statusText);
    }
  });
</script>

<img class="logo" src="./images/logo_new.png" alt="log" />
<div class={size}>
  <p align="justify">
    Here find the daily winners of the blue lobster, silver snail and green rhino. We also have a
    lovely assortment of runner ups.
  </p>
  <div class="title">Today's leaders</div>
  {#if today.length < 0}
    No winners yet today!
  {:else}
    <WinnerListing listing={today} />
  {/if}
  {#if yesterday.length > 0}
    <hr />
    <div class="title">Yesterday's leaders</div>
    <WinnerListing listing={yesterday} />
  {/if}
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
