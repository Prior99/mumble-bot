import { is, DataType, specify } from "hyrest";

import { MumbleUser } from ".";

export class Channel {
    @is()
    public name?: string;

    @is(DataType.int)
    public position?: number;

    @is() @specify(() => MumbleUser)
    public users?: MumbleUser[];

    @is() @specify(() => Channel)
    public children?: Channel[];
}
