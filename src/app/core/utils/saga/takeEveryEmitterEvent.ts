import { fork, take, cancelled, getContext } from "redux-saga/effects";
import { EventEmitter } from "pixi.js";
import { createEventEmitterChannel, EventEmitterChannelEmit } from "./createEventEmitterChannel";

export const takeEveryEmitterEvent = (eventEmitter: EventEmitter, eventName: string | symbol, worker: (...args: any[]) => Generator<any, any, any>) => fork(function* () {
    const eventEmitterChannel = createEventEmitterChannel(eventEmitter, eventName);

    try {
        while (true) {
            const { event, args }: EventEmitterChannelEmit = yield take(eventEmitterChannel);
            yield fork(worker, ...args);
        }
    } finally {
        if (yield cancelled()) {
            eventEmitterChannel.close();
        }
    }
});