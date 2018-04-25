import { is, DataType, specify, scope } from "hyrest";
import { world } from "../scopes";

export class MumbleUser {
    @is() @scope(world)
    public name?: string;

    @is(DataType.int) @scope(world)
    public id?: number;

    @is(DataType.int) @scope(world)
    public session?: number;
}
