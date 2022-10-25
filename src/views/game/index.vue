<template>
  <div class="main-wrap">
    <canvas class="canvas"></canvas>
  </div>
</template>
<script setup></script>
<style lang="scss">
.main-wrap {
  height: 100%;
  width: 100%;
  position: relative;
  .canvas {
    position: absolute;
    top: 50px;
    left: 50px;
    right: 50px;
    bottom: 50px;
    width: 100%;
    height: 100%;
    border: 2px solid #ccc;
    box-sizing: border-box;
  }
}
</style>
