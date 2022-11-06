export class Bullet {

  public options: any
  public ctx: any

  constructor(ctx: any, options: any) {
    this.options = options;
    this.ctx = ctx;
    this.render();
  }

  /**
   * 渲染
   */
  render() {
    const { x, y, size, color } = this.options;
    const { ctx } = this;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
  }

  /**
   * 更新位置
   */
  update() {
    const { x, y, location } = this.options;
    this.options.x = x + location.x;
    this.options.y = y + location.y;
    this.render();
  }

}
