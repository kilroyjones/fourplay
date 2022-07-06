<script>
  export let x;
  export let y;
  export let size;
  export let letter;
  export let color;
  export let selected;
  export let selectCell;
  export let id;
  export let animationDirection;
</script>

<div class="cell-wrapper" style="transform: translate({x}px, {y}px);">
  <div
    class="cell {color} {animationDirection} {selected}"
    style="width: {size}px; height: {size}px;font-size: {size == 70 ? 46 : (size / 70) * 46}px;"
    on:click={() => selectCell(id)}
  >
    {letter}
  </div>
</div>

<style>
  .cell-wrapper {
    position: absolute;
    cursor: pointer;
  }

  .cell {
    display: flex;
    color: #ffffff;
    background-color: #1974d2;
    font-size: 46px;
    font-weight: 700;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    padding: 0;
  }

  .letter {
    padding: 0;
    position: absolute;
    width: inherit;
    text-align: center;
    top: 50%;
    transform: translate(0, -50%);
  }

  .selected {
    background-color: #ffaa1d !important;
  }

  .isPlayerQuadrant {
    opacity: 1;
  }

  .isNotPlayerQuadrant {
    background-color: #5ea4e9;
  }

  .flipHorizontalPrevious,
  .flipHorizontalCurrent,
  .flipVerticalCurrent,
  .flipVerticalPrevious {
    opacity: 1;
    animation: fade 0.2s linear;
    animation-fill-mode: forwards;
    animation-iteration-count: 1;
  }

  .flipHorizontalPrevious {
    animation-name: flipHorizontalPrevious;
  }

  .flipHorizontalCurrent {
    animation-name: flipHorizontalCurrent;
  }

  .flipVerticalPrevious {
    animation-name: flipVerticalPrevious;
  }

  .flipVerticalCurrent {
    animation-name: flipVerticalCurrent;
  }

  @keyframes flipVerticalPrevious {
    0% {
      background-color: #ffaa1d;
      transform: rotateX(0deg);
    }
    1% {
      transform: rotateX(180deg);
    }
    50% {
      background-color: #1974d2;
    }
    51% {
      background-color: #1974d2;
    }
    100% {
      transform: rotateX(360deg);
    }
  }

  @keyframes flipVerticalCurrent {
    0% {
      background-color: #1974d2;
      transform: rotateX(0deg);
    }
    1% {
      transform: rotateX(180deg);
    }
    50% {
      background-color: #1974d2;
    }
    51% {
      background-color: #ffaa1d;
    }
    100% {
      transform: rotateX(360deg);
    }
  }

  @keyframes flipHorizontalPrevious {
    0% {
      background-color: #ffaa1d;
      transform: rotateY(0deg);
    }
    1% {
      transform: rotateY(180deg);
    }
    50% {
      background-color: #5f93c2;
    }
    51% {
      background-color: #1974d2;
    }
    100% {
      transform: rotateY(360deg);
    }
  }

  @keyframes flipHorizontalCurrent {
    0% {
      background-color: #1974d2;
      transform: rotateY(0deg);
    }
    1% {
      transform: rotateY(180deg);
    }
    50% {
      background-color: #1974d2;
    }
    51% {
      background-color: #ffaa1d;
    }
    100% {
      transform: rotateY(360deg);
    }
  }
</style>
