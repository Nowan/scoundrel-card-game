import type { Application } from "pixi.js";

declare global {
    interface Window {
        __PIXI_DEVTOOLS__: any;
    }
}

export function connectPixiDevTools(app: Application): void {
    window.__PIXI_DEVTOOLS__ = { app };
}

export default connectPixiDevTools;