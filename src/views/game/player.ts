import { BaseElement, ConfigType } from './base';

export class Player extends BaseElement {
  public canvas: any;
  constructor(canvas: any, config: ConfigType) {
    super(canvas, config);
    this.canvas = canvas;
    this.draw();
  }
}
