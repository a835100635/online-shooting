

export class Player {

  public options: any;
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
    const { x, y, size, color, text } = this.options;
    const { ctx } = this;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();

    if (text) {
      ctx.font = '20px Arial';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.fillText(text,  x+size/2-10, y+size/2-4);
    }

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

  /**
   * 边缘计算
   * @param keyCode 
   */
  verifyPosition(keyCode: number) {
    const { innerWidth, innerHeight, size, x, y, speed } = this.options;
    switch (keyCode) {
      case 37:
        return x - speed > size;
      case 38:
        return y - speed > size;
      case 39:
        return x + speed < innerWidth;
      case 40:
        return y + speed < innerHeight;
      default:
        return false;
    }
  }

}
