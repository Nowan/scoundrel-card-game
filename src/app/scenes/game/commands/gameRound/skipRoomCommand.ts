import { cancelled } from "redux-saga/effects";
import { FunctionalCommand } from "../Command";

export const skipRoomCommand: FunctionalCommand = (
    function* skipRoomCommand() {
        try {
            console.log("Skip room started", Date.now());
            yield new Promise(res => setTimeout(res, 5000))
            console.log("Skip room completed", Date.now())
            return "skip"
        }
        catch (err) {
            console.log("Skip room cleanup error", Date.now(), err)
        }
        finally {
            if (yield cancelled()) {
                console.log("Skip room cleanup triggered", Date.now());
            }
        }
    }
);