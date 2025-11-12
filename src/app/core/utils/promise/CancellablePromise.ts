import { race } from "./race";

export class CancellablePromise<T = void> extends Promise<T> {
    private _abortController = new AbortController();
    private _cleanupCallback: CancellablePromiseDisposer | null = null;

    static race = race;

    constructor(executor: CancellablePromiseExecutor<T>) {
        super((resolve, reject) => {
            this._cleanupCallback = executor(resolve, reject, this._abortController.signal) ?? null;
            const onAbortSignal = () => {
                this._abortController.signal.removeEventListener("abort", onAbortSignal);
                this._cleanupCallback?.();
                reject("Cancelled");
            }

            this._abortController.signal.addEventListener("abort", onAbortSignal);
        });
    }

    cancel() {
        if (!this._abortController.signal.aborted) {
            this._abortController.abort();
        }
    }
}

export interface CancellablePromiseExecutor<T> {
    (
        resolve: (value: T | PromiseLike<T>) => void,
        reject: (reason?: any) => void,
        signal: AbortSignal
    ): CancellablePromiseDisposer | void;
}

export type CancellablePromiseDisposer = (...args: any[]) => void;