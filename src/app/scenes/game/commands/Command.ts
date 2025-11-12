import { CommandContext } from "./CommandContext";

export abstract class Command {
    protected context: CommandContext;

    constructor(context: CommandContext) {
        this.context = context;
    }

    get cmd() {
        return this.context.cmd;
    }

    abstract execute<RETURN_TYPE = void>(...args: any[]): Generator<any, RETURN_TYPE, any>
}

export type FunctionalCommandThis = CommandContext & { context: CommandContext };

export type FunctionalCommand<RETURN_TYPE = any> = (this: FunctionalCommandThis, ...args: any[]) => Generator<any, RETURN_TYPE, any>