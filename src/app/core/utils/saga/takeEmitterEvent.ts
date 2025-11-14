import { take, cancelled, call } from "redux-saga/effects";
import { EventEmitter } from "pixi.js";
import {
    createEventEmitterChannel,
    EventEmitterChannelEmit,
} from "./createEventEmitterChannel";

// export function* takeEmitterEvent<ARGS extends any[] = any[]>(eventEmitter: EventEmitter, eventName: string | symbol): Generator<any, ARGS, ARGS> {
//     const eventEmitterChannel = createEventEmitterChannel(eventEmitter, eventName);

//     try {
//         while (true) {
//             const { event, args }: EventEmitterChannelEmit = yield take(eventEmitterChannel);
//             if (event === eventName) {
//                 eventEmitterChannel.close();
//                 return args as ARGS;
//             }
//         }
//     } finally {
//         if (yield cancelled()) {
//             eventEmitterChannel.close();
//         }
//     }
// }

export const takeEmitterEvent = <ARGS extends any[] = any[]>(eventEmitter: EventEmitter, eventName: string | symbol) => call(function* (): Generator<any, ARGS> {
    const eventEmitterChannel = createEventEmitterChannel(eventEmitter, eventName);

    try {
        const { event, args }: EventEmitterChannelEmit = yield take(eventEmitterChannel);
        eventEmitterChannel.close();
        return args as ARGS;
    } finally {
        if (yield cancelled()) {
            eventEmitterChannel.close();
        }
    }
})