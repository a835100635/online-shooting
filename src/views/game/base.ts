import { Bullet } from './bullet';
import { Player } from './player';

export interface LocationType {
  x: number;
  y: number;
}
export interface ConfigType {
  x: number;
  y: number;
  size: number;
  color: number | string;
  speed: number;
  location?: LocationType;
}
export class BaseElement {
  public x: number;
  public y: number;
  public size: number;
  public color: number | string;
  public speed: number;
  public ctx: any;
  public location: LocationType;

  public status: boolean;

  constructor(ctx: any, config: ConfigType) {
    const { x = 20, y = 20, size, color, speed = 2, location } = config;
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.speed = speed;
    this.status = true;
    this.location = location as LocationType;

    this.ctx = ctx;
  }

  // 绘制
  draw() {
    const { ctx, x, y, size, color } = this;
    // 开始路径
    ctx.beginPath();
    ctx.fillStyle = color;
    // 绘制圆 x y起始位置，size半径，0和1代表的是开始和结束位置，圆弧的弧度，顺时针false, true为逆时针
    ctx.arc(x, y, size, 0, 2 * Math.PI, false);
    // 填充
    ctx.fill();
    ctx.closePath();
  }

  // 移动
  move() {
    this.draw();
    const { x, y, location } = this;
    this.x = x + location.x;
    this.y = y + location.y;

    // 移动边界问题
    const { innerWidth, innerHeight } = window;
    if (x >= innerWidth || x <= 0 || y >= innerHeight || y <= 0) {
      this.status = false;
    }
  }

  // 动画
  animation(bullet: Bullet, player: Player) {
    console.log('animation 开始移动---->', bullet);
    const self = this;
    const action = () => {
      if (self.status) requestAnimationFrame(action);
      console.log('animation 移动中---->');
      self.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      const { innerWidth, innerHeight } = window;

      self.ctx.fillRect(0, 0, innerWidth, innerHeight);

      // 重新绘制plyer
      player.draw();

      self.move();
    };
    action();
  }
}
