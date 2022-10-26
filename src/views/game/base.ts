export interface ConfigType {
  x: number;
  y: number;
  size: number;
  color: number | string;
  speed: number;
  canvas: any;
}
export class BaseElement {
  public x: number;
  public y: number;
  public size: number;
  public color: number | string;
  public speed: number;
  public ctx: any;

  constructor(canvas: any, config: ConfigType) {
    const { x = 20, y = 20, size, color, speed } = config;
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.speed = speed;

    this.ctx = canvas.getContext('2d');
    this.ctx.fillStyle = 'rgba(0, 0, 0, .1)';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // 绘制
  draw() {
    const { ctx, x, y, size, color } = this;
    // 开始路径
    ctx.beginPath();
    // 绘制圆 x y起始位置，size半径，0和1代表的是开始和结束位置，圆弧的弧度，顺时针false, true为逆时针
    ctx.arc(x, y, size, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    // 填充
    ctx.fill();
  }
}
