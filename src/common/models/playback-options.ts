import { is, DataType } from "hyrest";

export class PlaybackOptions {
    @is(DataType.float)
    public pitch = 0;
}
