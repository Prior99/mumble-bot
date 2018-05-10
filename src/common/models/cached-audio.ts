import { is, scope, DataType, specify, uuid } from "hyrest";

import { world, enqueue, live, createSound } from "../scopes";

import { User } from ".";

/**
 * A cached audio.
 */
export class CachedAudio {
    /**
     * The date the audio was recorded.
     */
    @is() @scope(world, live) @specify(() => Date)
    public date?: Date;

    /**
     * The user from which the audio was recorded.
     */
    @is() @scope(world, live)
    public user?: User;

    /**
     * The id of the cached audio.
     */
    @scope(world, enqueue, live, createSound) @is().validate(uuid)
    public id?: string;

    /**
     * The duration of the audio in seconds.
     */
    @is(DataType.float) @scope(world, live)
    public duration?: number;

    @is(DataType.float) @scope(world, live)
    public amplitude?: number;
}
