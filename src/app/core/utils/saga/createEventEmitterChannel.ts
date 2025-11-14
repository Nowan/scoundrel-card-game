import { eventChannel, EventChannel } from "redux-saga";
import { EventEmitter } from "pixi.js";

export interface EventEmitterChannelEmit {
    event: string | symbol;
    args: any[];
}

export const createEventEmitterChannel = (eventEmitter: EventEmitter, event: string | symbol): EventChannel<EventEmitterChannelEmit> => (
    eventChannel<EventEmitterChannelEmit>(emitter => {
        const eventHandler = (...args: any[]) => emitter({ event, args });
        eventEmitter.on(event, eventHandler)
        return () => eventEmitter.off(event, eventHandler);
    })
);
