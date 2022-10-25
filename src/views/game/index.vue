<template>
  <div class="main-wrap">
    <canvas class="canvas" ref="canvarsRef"></canvas>
  </div>
</template>
<script setup>

import { onMounted, ref } from 'vue';
import { Player } from './player.ts'

const canvarsRef = ref();

onMounted(() => {
  console.log(canvarsRef.innerH);
  const { width, height } = canvarsRef.value;
  const player = new Player(canvarsRef.value, {
    x: width / 2,
    y: height / 2,
    size: 40,
    color: 'write',
    speed: 20,
  });

  console.log(player)
  
});




</script>
<style lang="scss">
.main-wrap {
  height: 100%;
  width: 100%;
  padding: 50px;
  box-sizing: border-box;
  .canvas {
    height: 100%;
    width: 100%;
    border: 2px solid #ccc;
    box-sizing: border-box;
  }
}
</style>
