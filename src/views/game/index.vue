<template>
  <div class="main-wrap" id="main-wrap">
    <canvas class="canvas" ref="canvasRef" id="canvas"></canvas>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Player } from '../lib/player';
import { Bullet } from '../lib/bullet';
import { getRandomColor, getRandomId } from '../../utils/index';
import { io, Socket } from 'socket.io-client';
const router = useRouter();
const playerType = {
  player: 0,
  enemy: 1
};
const canvasRef = ref();
let socket: Socket;
let socketId: string;
let player: Player | undefined;
let ctx: CanvasRenderingContext2D;
const { innerWidth, innerHeight } = window;
onMounted(() => {
  initOperate();
  canvasRef.value.width = innerWidth;
  canvasRef.value.height = innerHeight;

  ctx = canvasRef.value.getContext('2d');
  ctx.fillStyle = '#ccc';
  ctx.fillRect(0, 0, innerWidth, innerHeight);

  // 创建玩家
  player = createPlayer(playerType.player, { text: 'A' });
  allPlayer.set(player?.options.id, player);
  console.log('初始化玩家 ===>', player, player?.options.id, player?.options.x, player?.options.y);
  // 上传玩家属性
  initSocket();
});

const allPlayer = new Map();
const allBullet = new Map();

/**
 * 创建玩家
 */
const createPlayer = (type: number, { id, x, y, color, text }: any = {}) => {
  // 判断是否存在
  if (allPlayer.has(id)) return;
  const p = new Player(ctx, {
    id: id || getRandomId(10),
    x: x || Math.round(Math.random() * innerWidth),
    y: y || Math.round(Math.random() * innerHeight),
    size: 20,
    color: color || getRandomColor(),
    speed: 20,
    innerWidth,
    innerHeight,
    text
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
    renderElements(e.keyCode);
    updatePlayer();
  };
  // 玩家点击创建球
  window.onmousedown = function (e) {
    renderElements();
    const bullet = createBullet(player as Player, e);
    // 同步创建子弹
    updateBullet(bullet);
  };
};

/**
 * 渲染所有的元素
 */
const renderElements = (keyCode?: number) => {
  // 清空画布
  clearRect();
  // 渲染子弹
  allBullet.forEach((item) => {
    item.render();
  });
  // 更新玩家
  allPlayer.get(player?.options.id).update(keyCode);
};

/**
 *  创建 bullet
 */
const createBullet = (player: Player, e: MouseEvent) => {
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
  return bullet;
};

/**
 * 清空画布
 */
const clearRect = () => {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  ctx.fillStyle = '#ccc';
};

/**
 * 定时任务
 */
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
      // 同步的子弹 排除自己
      if (item.options.player === pl.options.id) return;

      // 同步过来的子弹 判断是否命中
      if (item.options.player && dist - item.options.size - pl.options.size < player?.options.size / 2) {
        console.log('命中 === --->', item, pl);
        // 删除敌人与子弹
        allPlayer.delete(pl.options.id);
        allBullet.delete(item.options.id);
        // 同步子弹 消失
        socket.emit('delete_bullet', item.options.id);
        return;
      }

      if (
        dist - item.options.size - pl.options.size < player?.options.size / 2 &&
        pl.options.id !== player?.options.id
      ) {
        console.log('命中 ===>', item, pl);
        // 删除敌人与子弹
        allPlayer.delete(pl.options.id);
        allBullet.delete(item.options.id);
      }
    });

    item.update();
  });
};
timingTask();

/**
 * socket 事件
 */
const initSocket = () => {
  console.log('initSocket ===> ');
  socket = io('ws://localhost:3000', {
    // reconnect: true
  });
  // 连接成功
  socket.on('connect', () => {
    console.log('socket connect ===>');
    router.replace({
      path: '/game',
      query: {
        sid: socket.id,
        pid: player?.options.id
      }
    });
    socketId = socket.id;
    // 更新玩家信息
    updatePlayer();
  });

  socket.on('_update', (data) => {
    console.log('update player ===>', data);
    clearRect();
    for (const key of Object.keys(data)) {
      if (data[key].id !== player?.options.id) {
        const p = allPlayer.get(data[key].id);
        if (p) {
          Object.assign(p.options, data[key]);
          p.update();
        } else {
          createPlayer(playerType.enemy, data[key]);
        }
      }
    }
  });

  socket.on('_update_bullet', (data) => {
    console.log('update bullet ===>', data, allBullet);
    const { id, x, y, size, color, speed, location, player } = data;
    const bullet = new Bullet(ctx, { id, x, y, size, color, speed, location, player });
    allBullet.set(id, bullet);
  });

  // 同步子弹 打中后 删除该子弹
  socket.on('_delete_bullet', (bulletId) => {
    console.log('delete bullet ===>', bulletId);
    allBullet.delete(bulletId);
  });

  // 断开连接
  socket.on('disconnect', (reason) => {
    console.log(socket.connected);
    console.log('socket disconnect ===>', reason);
  });
};

/**
 * 同步玩家信息
 */
const updatePlayer = () => {
  console.log('sync player ===>', player);
  socket.emit('update_player', {
    sid: socketId,
    id: player?.options.id,
    x: player?.options.x,
    y: player?.options.y,
    color: player?.options.color
  });
};

/**
 * 同步
 */
const updateBullet = (bullet: Bullet) => {
  console.log('sync bullet ===>', bullet);
  socket.emit('update_bullet', {
    sid: socketId,
    player: player?.options.id,
    ...bullet.options
  });
};
</script>

<style lang="scss">
.main-wrap {
  height: 100%;
  width: 100%;
}
</style>
