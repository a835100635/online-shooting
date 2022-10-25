export class BaseElement {

    public x: number
    public y: number
    public size: number
    public color: number | string
    public speed: number
    public canvars: any

    constructor(canvars: any, { x: number, y: number, size: number, color: number, speed: number }) {
        this.canvars = canvars
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.speed = speed;
    }

     // 绘制
     draw() {
        this.canvars.beginPath();
        this.canvars.arc(this.x, this.y, this.size, 0, 2 * Math.PI, false);
        this.canvars.fillStyle = this.color;
        this.canvars.fill();
    };
}