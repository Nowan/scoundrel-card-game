import { CancellablePromise } from "./CancellablePromise";

export async function race(promises: CancellablePromise<any>[]) {
    return new CancellablePromise((resolve, reject) => {
        const wrapped = promises.map(promise =>
            promise.then(
                value => ({ status: "fulfilled", value, promise }),
                reason => ({ status: "rejected", reason, promise })
            )
        ) as WrappedPromise<any>[];

        Promise.race(wrapped).then(result => {
            promises
                .filter(promise => promise !== result.promise)
                .forEach(promise => promise.cancel());

            if (result.status === "fulfilled") {
                resolve(result.value);
            } else {
                reject(result.reason);
            }
        });
    });
}

type WrappedPromise<T> = FulfilledWrappedPromise<T> | RejectedWrappedPromise<T>;
type FulfilledWrappedPromise<T> = Promise<{ status: "fulfilled"; value: T; promise: CancellablePromise<T> }>;
type RejectedWrappedPromise<T> = Promise<{ status: "rejected"; reason: any; promise: CancellablePromise<T> }>;