import { BaseElement, ConfigType } from './base';
import { Bullet } from './bullet';

export class Player extends BaseElement {
  public canvas: any;
  constructor(ctx: any, config: ConfigType) {
    super(ctx, config);
    this.draw();
    this.init();
  }

  init() {
    window.addEventListener(
      'mousedown',
      (event: MouseEvent) => {
        this.onMousedownAction(event, this);
      },
      false
    );
  }

  onMousedownAction(e: MouseEvent, self: Player) {
    console.log('mousedown====> 创建子弹');
    const { x, y, ctx } = self;
    // 返回原点到点的线段与x轴正方向之间的平面角度
    const location = Math.atan2(e.clientY - y, e.clientX - x);
    const bullet = new Bullet(ctx, {
      x,
      y,
      size: 5,
      color: 'red',
      speed: 2,
      location: {
        x: Math.cos(location) * 8,
        y: Math.sin(location) * 8
      }
    });
    bullet.draw();
    bullet.animation(bullet, self);
  }
}
