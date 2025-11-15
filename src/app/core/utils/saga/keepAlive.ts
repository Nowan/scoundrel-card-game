import { call, cancelled } from "redux-saga/effects";

export const keepAlive = () => call(function* () {
    let resolveInnerPromise: (() => void) | null = null;

    try {
        yield new Promise<void>(resolve => {
            resolveInnerPromise = resolve
        });
    }
    finally {
        if (yield cancelled()) {
            (resolveInnerPromise as unknown as () => void)();
        }
    }
})