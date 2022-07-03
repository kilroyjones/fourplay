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

<!-- <script ✂prettier:content✂="CiAgZXhwb3J0IGxldCB4OwogIGV4cG9ydCBsZXQgeTsKICBleHBvcnQgbGV0IHNpemU7CiAgZXhwb3J0IGxldCBsZXR0ZXI7CiAgZXhwb3J0IGxldCBjb2xvcjsKICBleHBvcnQgbGV0IHNlbGVjdGVkOwogIGV4cG9ydCBsZXQgc2VsZWN0Q2VsbDsKICBleHBvcnQgbGV0IGlkOwogIGV4cG9ydCBsZXQgYW5pbWF0aW9uU3RhdGU7CiAgZXhwb3J0IGxldCBhbmltYXRpb25EaXJlY3Rpb247Cg==" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=">{}</script>

<div class="cell-wrapper" style="transform: translate({x}px, {y}px);">
  {#if selected == 1 && animationState == 0}
    <div
      class="cell {color} selected"
      style="width: {size}px; height: {size}px; font-size: {size == 70 ? 46 : (size / 70) * 46}px;"
      on:click={() => selectCell(id)}
    >
      {letter}
    </div>
  {:else if (selected = 1 && animationState == 1)}
    <div
      class="cell {color} {animationDirection === 'horizontal'
        ? 'flipHorizontalCurrent'
        : 'flipVerticalCurrent'} selected"
      style="width: {size}px; height: {size}px;font-size: {size == 70 ? 46 : (size / 70) * 46}px;"
      on:click={() => selectCell(id)}
    >
      {letter}
    </div>
  {:else if (selected = 1 && animationState == 2)}
    <div
      class="cell {color} {animationDirection === 'horizontal'
        ? 'flipHorizontalPrevious'
        : 'flipVerticalPrevious'}"
      style="width: {size}px; height: {size}px; font-size: {size == 70 ? 46 : (size / 70) * 46}px;"
      on:click={() => selectCell(id)}
    >
      {letter}
    </div>
  {:else}
    <div
      class="cell {color} "
      style="width: {size}px; height: {size}px;"
      on:click={() => selectCell(id)}
    >
      <span class="letter" style="font-size: {size == 70 ? 46 : (size / 70) * 46}px">{letter}</span>
    </div>
  {/if}
</div>

<style ✂prettier:content✂="CiAgLmNlbGwtd3JhcHBlciB7CiAgICBwb3NpdGlvbjogYWJzb2x1dGU7CiAgICBjdXJzb3I6IHBvaW50ZXI7CiAgfQoKICAuY2VsbCB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgY29sb3I6ICNmZmZmZmY7CiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMTk3NGQyOwogICAgZm9udC1zaXplOiA0NnB4OwogICAgZm9udC13ZWlnaHQ6IDcwMDsKICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGJvcmRlci1yYWRpdXM6IDVweDsKICAgIC13ZWJraXQtdG91Y2gtY2FsbG91dDogbm9uZTsKICAgIC13ZWJraXQtdXNlci1zZWxlY3Q6IG5vbmU7CiAgICAta2h0bWwtdXNlci1zZWxlY3Q6IG5vbmU7CiAgICAtbW96LXVzZXItc2VsZWN0OiBub25lOwogICAgLW1zLXVzZXItc2VsZWN0OiBub25lOwogICAgdXNlci1zZWxlY3Q6IG5vbmU7CiAgICBwYWRkaW5nOiAwOwogIH0KCiAgLmxldHRlciB7CiAgICBwYWRkaW5nOiAwOwogICAgcG9zaXRpb246IGFic29sdXRlOyAvKiAyICovCiAgICB3aWR0aDogaW5oZXJpdDsKICAgIHRleHQtYWxpZ246IGNlbnRlcjsKICAgIHRvcDogNTAlOyAvKiAzICovCiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCAtNTAlKTsKICB9CgogIC5zZWxlY3RlZCB7CiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZhYTFkICFpbXBvcnRhbnQ7CiAgfQoKICAuaXNQbGF5ZXJRdWFkcmFudCB7CiAgICBvcGFjaXR5OiAxOwogIH0KCiAgLmlzTm90UGxheWVyUXVhZHJhbnQgewogICAgYmFja2dyb3VuZC1jb2xvcjogIzVlYTRlOTsKICB9CgogIC5mbGlwSG9yaXpvbnRhbFByZXZpb3VzLAogIC5mbGlwSG9yaXpvbnRhbEN1cnJlbnQsCiAgLmZsaXBWZXJ0aWNhbEN1cnJlbnQsCiAgLmZsaXBWZXJ0aWNhbFByZXZpb3VzIHsKICAgIG9wYWNpdHk6IDE7CiAgICBhbmltYXRpb246IGZhZGUgMC4ycyBsaW5lYXI7CiAgICBhbmltYXRpb24tZmlsbC1tb2RlOiBmb3J3YXJkczsKICAgIGFuaW1hdGlvbi1pdGVyYXRpb24tY291bnQ6IDE7CiAgfQoKICAuZmxpcEhvcml6b250YWxQcmV2aW91cyB7CiAgICBhbmltYXRpb24tbmFtZTogZmxpcEhvcml6b250YWxQcmV2aW91czsKICB9CgogIC5mbGlwSG9yaXpvbnRhbEN1cnJlbnQgewogICAgYW5pbWF0aW9uLW5hbWU6IGZsaXBIb3Jpem9udGFsQ3VycmVudDsKICB9CgogIC5mbGlwVmVydGljYWxQcmV2aW91cyB7CiAgICBhbmltYXRpb24tbmFtZTogZmxpcFZlcnRpY2FsUHJldmlvdXM7CiAgfQoKICAuZmxpcFZlcnRpY2FsQ3VycmVudCB7CiAgICBhbmltYXRpb24tbmFtZTogZmxpcFZlcnRpY2FsQ3VycmVudDsKICB9CgogIEBrZXlmcmFtZXMgZmxpcFZlcnRpY2FsUHJldmlvdXMgewogICAgMCUgewogICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZhYTFkOwogICAgICB0cmFuc2Zvcm06IHJvdGF0ZVgoMGRlZyk7CiAgICB9CiAgICAxJSB7CiAgICAgIHRyYW5zZm9ybTogcm90YXRlWCgxODBkZWcpOwogICAgfQogICAgNTAlIHsKICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzE5NzRkMjsKICAgIH0KICAgIDUxJSB7CiAgICAgIGJhY2tncm91bmQtY29sb3I6ICMxOTc0ZDI7CiAgICB9CiAgICAxMDAlIHsKICAgICAgdHJhbnNmb3JtOiByb3RhdGVYKDM2MGRlZyk7CiAgICB9CiAgfQoKICBAa2V5ZnJhbWVzIGZsaXBWZXJ0aWNhbEN1cnJlbnQgewogICAgMCUgewogICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMTk3NGQyOwogICAgICB0cmFuc2Zvcm06IHJvdGF0ZVgoMGRlZyk7CiAgICB9CiAgICAxJSB7CiAgICAgIHRyYW5zZm9ybTogcm90YXRlWCgxODBkZWcpOwogICAgfQogICAgNTAlIHsKICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzE5NzRkMjsKICAgIH0KICAgIDUxJSB7CiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmFhMWQ7CiAgICB9CiAgICAxMDAlIHsKICAgICAgdHJhbnNmb3JtOiByb3RhdGVYKDM2MGRlZyk7CiAgICB9CiAgfQoKICBAa2V5ZnJhbWVzIGZsaXBIb3Jpem9udGFsUHJldmlvdXMgewogICAgMCUgewogICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZhYTFkOwogICAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMGRlZyk7CiAgICB9CiAgICAxJSB7CiAgICAgIHRyYW5zZm9ybTogcm90YXRlWSgxODBkZWcpOwogICAgfQogICAgNTAlIHsKICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzVmOTNjMjsKICAgIH0KICAgIDUxJSB7CiAgICAgIGJhY2tncm91bmQtY29sb3I6ICMxOTc0ZDI7CiAgICB9CiAgICAxMDAlIHsKICAgICAgdHJhbnNmb3JtOiByb3RhdGVZKDM2MGRlZyk7CiAgICB9CiAgfQoKICBAa2V5ZnJhbWVzIGZsaXBIb3Jpem9udGFsQ3VycmVudCB7CiAgICAwJSB7CiAgICAgIGJhY2tncm91bmQtY29sb3I6ICMxOTc0ZDI7CiAgICAgIHRyYW5zZm9ybTogcm90YXRlWSgwZGVnKTsKICAgIH0KICAgIDElIHsKICAgICAgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZyk7CiAgICB9CiAgICA1MCUgewogICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMTk3NGQyOwogICAgfQogICAgNTElIHsKICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmYWExZDsKICAgIH0KICAgIDEwMCUgewogICAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMzYwZGVnKTsKICAgIH0KICB9Cg==" ✂prettier:content✂="" ✂prettier:content✂="" ✂prettier:content✂="" ✂prettier:content✂="" ✂prettier:content✂="" ✂prettier:content✂="" ✂prettier:content✂="" ✂prettier:content✂=""></style> -->
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
    position: absolute; /* 2 */
    width: inherit;
    text-align: center;
    top: 50%; /* 3 */
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
