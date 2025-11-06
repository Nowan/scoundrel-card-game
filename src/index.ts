import { App } from "./app/App";
import { connectPixiDevTools } from "../devscripts/connectPixiDevTools";

import "./index.css";

window.onload = async (event) => {
    const app = await createApp();

    initResizeObserver(app);
    connectPixiDevTools(app);

    app.startAtInitialScene();
};

function initResizeObserver(app: App) {
    window.addEventListener("resize", () => onResize(app));
    onResize(app);
}

async function createApp(): Promise<App> {
    const app = new App();
    await app.init();

    document.body.appendChild(app.canvas);

    return app;
}

function onResize(app: App) {
    const targetWidth = window.innerWidth;
    const targetHeight = window.innerHeight;

    app.renderer.resize(targetWidth, targetHeight);
}