<template>
  <div class="main-wrap" id="main-wrap">
    <canvas class="canvas" ref="canvasRef" id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import { Player } from '../lib/player.ts';
import { Bullet } from '../lib/bullet.ts';
import { getRandomColor, getRandomId } from '../../utils/index';
import { io } from 'socket.io-client';

const canvasRef = ref();
let socket = null;
let socketId = null;
let player = null;
let ctx = null;
const { innerWidth, innerHeight } = window;
onMounted(() => {
  initOperate();
  canvasRef.value.width = innerWidth;
  canvasRef.value.height = innerHeight;

  ctx = canvasRef.value.getContext('2d');
  ctx.fillStyle = '#ccc';
  ctx.fillRect(0, 0, innerWidth, innerHeight);

  // 创建玩家
  player = createPlayer(0);
  allPlayer.set(player.options.id, player);
  // 上传玩家属性
  initSocket();
  console.log(player, innerWidth, innerHeight);
});

const allPlayer = new Map();
const allBullet = new Map();

/**
 * 创建玩家
 */
const createPlayer = (type, { id, x, y, color } = {}) => {
  // 判断是否存在
  if (allPlayer.has(id)) return;
  const p = new Player(ctx, {
    id: id || getRandomId(10),
    x: x || innerWidth / Math.floor(Math.random() * 3 + 1),
    y: y || innerHeight / Math.floor(Math.random() * 3 + 1),
    size: 20,
    color: color || getRandomColor(),
    speed: 6,
    innerWidth,
    innerHeight
  });
  // 0 => 玩家 1 => 敌人
  if (type === 0) {
    return p;
  } else {
    allPlayer.set(p.options.id, p);
  }
};

/**
 * 初始化操作监听
 */
const initOperate = () => {
  // 键盘事件 只控制状态值
  window.onkeydown = function (e) {
    console.log('onkeydown-->', e.keyCode);
    renderElements(e.keyCode);
    updatePlayer();
  };
  // 玩家点击创建球
  window.onmousedown = function (e) {
    renderElements();
    createBullet(player, e);
  };
};

/**
 * 渲染所有的元素
 */
const renderElements = (keyCode) => {
  // 清空画布
  clearRect();
  // 渲染子弹
  allBullet.forEach((item) => {
    item.render();
  });
  // 渲染玩家
  // allPlayer.forEach((item) => {
  //   item.update(keyCode);
  // });
  allPlayer.get(player.options.id).update(keyCode);
};

/**
 *  创建 bullet
 */
const createBullet = (player, e) => {
  const { x, y } = player.options;
  // 返回原点到点的线段与x轴正方向之间的平面角度
  const location = Math.atan2(e.clientY - y, e.clientX - x);
  const bullet = new Bullet(ctx, {
    id: getRandomId(),
    x,
    y,
    size: 5,
    color: 'red',
    speed: 1,
    location: {
      x: Math.cos(location) * 8,
      y: Math.sin(location) * 8
    }
  });
  allBullet.set(bullet.options.id, bullet);
};

/**
 * 清空画布
 */
const clearRect = () => {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  ctx.fillStyle = '#ccc';
};

const timingTask = () => {
  requestAnimationFrame(timingTask);
  if (!ctx || !canvasRef.value) return;
  clearRect();
  allPlayer.forEach((item) => {
    item.render();
  });
  allBullet.forEach((item) => {
    const { x, y } = item.options;
    // 边缘判断 出边界线外删除
    if (x >= innerWidth || x <= 0 || y >= innerHeight || y <= 0) {
      allBullet.delete(item.options.id);
    }

    // 是否碰撞玩家
    allPlayer.forEach((pl) => {
      const dist = Math.hypot(pl.options.x - item.options.x, pl.options.y - item.options.y);
      if (pl.options.id !== player.options.id) {
        console.log(dist);
      }
      if (dist - item.options.size - pl.options.size < player.options.size / 2 && pl.options.id !== player.options.id) {
        console.log('打中了--》', item, pl);
        // cancelAnimationFrame(op);
        // 删除敌人与子弹
        allPlayer.delete(pl.options.id);
        allBullet.delete(item.options.id);
      }
    });

    item.update();
  });
};
timingTask();

const initSocket = () => {
  socket = io.connect('ws://localhost:3000', {
    reconnect: true
  });
  // 连接成功
  socket.on('connect', () => {
    console.log('监听客户端连接成功-connect', socket, socket.id);
    socketId = socket.id;
    // 更新玩家信息
    updatePlayer();
  });

  socket.on('_update', (data) => {
    console.log('update--> 更新玩家信息', data);
    for (const key of Object.keys(data)) {
      console.log(key, data[key]);
      if (data !== player.options.id) {
        createPlayer(data[key]);
      }
    }
  });

  // 断开连接
  socket.on('disconnect', (reason) => {
    console.log(socket.connected);
    console.log('断开连接-disconnect', reason);
  });
};

const updatePlayer = () => {
  socket.emit('update_player', {
    sid: socketId,
    id: player.options.id,
    x: player.options.x,
    y: player.options.y,
    color: player.options.color
  });
};
</script>

<style lang="scss">
.main-wrap {
  height: 100%;
  width: 100%;
}
</style>
