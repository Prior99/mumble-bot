import { is, scope, DataType, specify, uuid } from "hyrest";

import { world, enqueue } from "../scopes";

import { User } from ".";

/**
 * A cached audio.
 */
export class CachedAudio {
    constructor(id?: string, user?: User, duration?: number) {
        if (id && user && duration) {
            this.user = user;
            this.duration = duration;
            this.id = id;
            this.protected = false;
            this.date = new Date();
        }
    }

    /**
     * The date the audio was recorded.
     */
    @is() @scope(world) @specify(() => Date)
    public date?: Date;

    /**
     * The user from which the audio was recorded.
     */
    @is() @scope(world)
    public user?: User;

    /**
     * The id of the cached audio.
     */
    @scope(world, enqueue) @is().validate(uuid)
    public id?: string;

    /**
     * The duration of the audio in seconds.
     */
    @is(DataType.float) @scope(world)
    public duration?: number;

    /**
     * Whether the audio was protected by someone or not.
     */
    @is(DataType.bool) @scope(world)
    public protected?: boolean;
}
