import { cancelled } from "redux-saga/effects";
import { FunctionalCommand } from "../Command";

export const faceRoomCommand: FunctionalCommand = (
    function* faceRoomCommand() {
        try {
            console.log("Face room started", Date.now());
            yield new Promise(res => setTimeout(res, 1000))
            console.log("Face room completed", Date.now())
            return "face"
        }
        catch (err) {
            console.log("Face room cleanup error", Date.now(), err)
        }
        finally {
            if (yield cancelled()) {
                console.log("Face room cleanup triggered", Date.now());
            }
        }
    }
);