<template>
  <div class="main-wrap" id="main-wrap">
    <div class="message-block">
      <div class="status">游戏状态：{{ isPlay ? '游戏中' : '未开始' }}</div>
      <div class="score">分数：{{ score }}</div>
    </div>
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
  // 自定义游戏名称 取第一个
  // eslint-disable-next-line no-alert
  // const playerName = window.prompt('开始游戏前,请输入一个长度的字符作为游戏名称', 'A');
  const playerName = 'A';

  initOperate();
  canvasRef.value.width = innerWidth;
  canvasRef.value.height = innerHeight;

  ctx = canvasRef.value.getContext('2d');
  ctx.fillStyle = '#ccc';
  ctx.fillRect(0, 0, innerWidth, innerHeight);

  // 创建玩家
  player = createPlayer(playerType.player, { text: `${playerName}`.trim()[0] });
  allPlayer.set(player?.options.id, player);
  console.log('初始化玩家 ===>', player, player?.options.id, player?.options.x, player?.options.y);
  // 上传玩家属性
  initSocket();
});

// 所有玩家集合
const allPlayer = new Map();
// 所有子弹集合
const allBullet = new Map();
// 分数
const score = ref(0);
// 是否开始开始优先
const isPlay = ref(false);

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
  // 0 => 玩家 1 => 敌人xw
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
  window.onkeydown = function (e: KeyboardEvent) {
    if (player?.verifyPosition(e.keyCode)) {
      renderElements(e.keyCode);
      updatePlayer();
    }
  };
  // 玩家点击创建球
  window.onmousedown = function (e: MouseEvent) {
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
  console.log(location);
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
 * socket 事件
 */
// eslint-disable-next-line no-unused-vars
const initSocket = () => {
  console.log('initSocket ===> ');
  socket = io(`ws://${process.env.VUE_APP_SOCKET_URL}:${process.env.VUE_APP_SOCKET_PORT}/online`);
  // 连接成功
  socket.on('connect', () => {
    console.log('socket connect ===>');
    // 设置游戏状态
    isPlay.value = true;
    // 把socket id 和玩家id 设置在url中
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

  socket.on('connect_update_player', (data) => {
    console.log('connect_update_player ===>', data);
    parseSyncData(data);
  });

  socket.on('_update', (data) => {
    console.log('update player ===>', data);
    clearRect();
    parseSyncData(data);
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

  // 玩家下线
  socket.on('offline_player', (playerInfo) => {
    console.log('player offline ===>', playerInfo);
    // 下线玩家 删除 TODO: 提示玩家下线
    if (allPlayer.has(playerInfo.id)) {
      allPlayer.delete(playerInfo.id);
    }
  });

  // 断开连接
  socket.on('disconnect', (reason) => {
    console.log(socket.connected);
    console.log('socket disconnect ===>', reason);
  });
};

/**
 * 解析同步玩家信息
 * parse sync data
 */
const parseSyncData = (data: any) => {
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
};

/**
 * 同步玩家信息
 */
const updatePlayer = () => {
  console.log('sync player ===>', player);
  socket &&
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
  socket &&
    socket.emit('update_bullet', {
      sid: socketId,
      player: player?.options.id,
      ...bullet.options
    });
};

/**
 * 击中敌人
 */
const hitThePlayer = (pl: Player, bullet: Bullet) => {
  console.log('命中敌人 === --->', pl, bullet);
  // 分数增加
  score.value += 10;
  // 删除敌人与子弹
  allPlayer.delete(pl.options.id);
  allBullet.delete(bullet.options.id);
};

/**
 * 玩家被击中
 */
const beingHit = (pl: Player, bullet: Bullet) => {
  console.log('被敌人命中 === --->', pl, bullet);
  score.value = 0;
  isPlay.value = false;
  // 删除敌人与子弹
  allPlayer.delete(pl.options.id);
  allBullet.delete(bullet.options.id);
  // 同步子弹 消失
  socket && socket.emit('delete_bullet', bullet.options.id);
};

/**
 * 定时任务
 */
const timingTask = () => {
  requestAnimationFrame(timingTask);
  if (!ctx || !canvasRef.value) return;
  // 清空画布
  clearRect();
  // 重新渲染
  allPlayer.forEach((pl: Player) => {
    pl.render();
  });
  // 遍历子弹
  allBullet.forEach((item: Bullet) => {
    const { x, y } = item.options;
    // 边缘判断 出边界线外删除
    if (x >= innerWidth || x <= 0 || y >= innerHeight || y <= 0) {
      allBullet.delete(item.options.id);
    }

    // 是否碰撞玩家
    allPlayer.forEach((pl: Player) => {
      const dist = Math.hypot(pl.options.x - item.options.x, pl.options.y - item.options.y);
      // 同步的子弹 排除自己
      if (item.options.player === pl.options.id) return;

      // 同步过来的子弹 判断是否命中
      if (item.options.player && dist - item.options.size - pl.options.size < player?.options.size / 2) {
        beingHit(pl, item);
        return;
      }

      if (
        dist - item.options.size - pl.options.size < player?.options.size / 2 &&
        pl.options.id !== player?.options.id
      ) {
        hitThePlayer(pl, item);
      }
    });

    item.update();
  });
};
timingTask();
</script>

<style lang="scss" scoped>
.main-wrap {
  height: 100%;
  width: 100%;
  position: relative;
  .message-block {
    position: absolute;
    top: 0;
    left: 0;
    .status {
      font-size: 20px;
    }
    .score {
      font-size: 20px;
    }
  }
}
</style>
