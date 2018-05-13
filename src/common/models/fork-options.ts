import { is, DataType, specify, required, scope } from "hyrest";
import { fork } from "../scopes";

export class Action {
    @is(DataType.str).validate(required) @scope(fork)
    public action: "crop";

    @is(DataType.float).validate(required) @scope(fork)
    public start: number;

    @is(DataType.float).validate(required) @scope(fork)
    public end: number;
}

export class ForkOptions {
    @is().validate(required) @scope(fork)
    public description?: string;

    @is().validate(required) @scope(fork)
    public overwrite?: boolean;

    @is() @specify(() => Action)
    public actions: Action[];
}
