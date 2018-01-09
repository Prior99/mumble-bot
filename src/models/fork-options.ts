import { is, DataType, specify } from "hyrest";

export class Action {
    @is(DataType.str)
    public action: "crop";

    @is(DataType.float)
    public begin: number;

    @is(DataType.float)
    public end: number;
}

export class ForkOptions {
    @is()
    public quote?: string;

    @is()
    public overwrite?: boolean;

    @is() @specify(() => Action)
    public actions: Action[];
}
