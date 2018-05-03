import { is, DataType, scope, specify } from "hyrest";
import { Sound } from "./sound";
import { world } from "../scopes";

export class SoundsQueryResult {
    @is(DataType.int) @scope(world)
    public totalSounds: number;

    @is(DataType.int) @scope(world)
    public limit: number;

    @is(DataType.int) @scope(world)
    public offset: number;

    @is() @scope(world) @specify(() => Sound)
    public sounds: Sound[];
}
