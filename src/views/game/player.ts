
import { BaseElement } from "./base.ts";

export class Player extends BaseElement {
    // canvars: any
    constructor(canvars, config) {
        super(canvars, config);
        this.canvars = canvars
        this.draw()
    }
} 