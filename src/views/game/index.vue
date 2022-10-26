<template>
  <div class="main-wrap">
    <canvas class="canvas" ref="canvasRef" id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import { Player } from './player.ts';

const canvasRef = ref();

onMounted(() => {
  const { innerWidth, innerHeight } = window;
  canvasRef.value.width = innerWidth;
  canvasRef.value.height = innerHeight;
  const player = new Player(canvasRef.value, {
    x: innerWidth / 2,
    y: innerHeight / 2,
    size: 20,
    color: 'black',
    speed: 20
  });

  console.log(player, innerWidth, innerHeight);
});
</script>
<style lang="scss">
.main-wrap {
  height: 100%;
  width: 100%;
}
</style>
