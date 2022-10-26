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

  const ctx = canvasRef.value.getContext('2d');
  // ctx.fillStyle = '#66ffff';
  ctx.fillRect(0, 0, innerWidth, innerHeight);

  // 创建玩家
  const player = new Player(ctx, {
    x: innerWidth / 2,
    y: innerHeight / 2,
    size: 20,
    color: '#66ffff',
    speed: 0.2
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
