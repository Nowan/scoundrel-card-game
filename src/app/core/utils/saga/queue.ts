import { call, CallEffect, Effect } from "redux-saga/effects";

export function queue(effects: Effect[]): CallEffect {
    return call(function* () {
        for (let effect of effects) {
            yield effect;
        }
    })
}