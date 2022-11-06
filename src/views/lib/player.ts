

export class Player {

  private options: any;
  private ctx: any;

  constructor(ctx: any, options: any) {
    this.ctx = ctx;
    this.options = options;
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
   * 更新位置信息
   * @param keyCode 键盘码值
   */
  update(keyCode?: number) {
    const { x, y, speed } = this.options;
    switch (keyCode) {
      case 37:
        this.options.x = x - speed;
        break;
      case 38:
        this.options.y = y - speed;
        break;
      case 39:
        this.options.x = x + speed;
        break;
      case 40:
        this.options.y = y + speed;
        break;
    }
    // 渲染
    this.render();
  }

}
