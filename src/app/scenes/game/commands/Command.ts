import { CommandContext } from "./CommandContext";

export abstract class Command {
    protected context: CommandContext;

    constructor(context: CommandContext) {
        this.context = context;
    }

    get cmd() {
        return this.context.cmd;
    }

    abstract execute<RETURN_TYPE = void>(...args: any[]): Promise<RETURN_TYPE>;
}

export type FunctionalCommandThis = CommandContext & { context: CommandContext };

export type FunctionalCommand<RETURN_TYPE = void> = (this: FunctionalCommandThis, ...args: any[]) => Promise<RETURN_TYPE>;