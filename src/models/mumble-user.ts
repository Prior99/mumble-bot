import { is, DataType, specify } from "hyrest";

export class MumbleUser {
    @is()
    public name?: string;

    @is(DataType.int)
    public id?: number;

    @is(DataType.int)
    public session?: number;
}
