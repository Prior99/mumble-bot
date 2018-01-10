import { is, scope, DataType, specify, uuid } from "hyrest";
import * as Uuid from "uuid";

import { world } from "../../scopes";

import { DatabaseUser } from ".";

/**
 * A cached audio.
 */
export class CachedAudio {
    constructor(filename?: string, user?: DatabaseUser, duration?: number) {
        if (filename && user && duration) {
            this.file = filename;
            this.user = user;
            this.duration = duration;
            this.id = Uuid.v4();
            this.protected = false;
            this.date = new Date();
        }
    }

    /**
     * The filename of the audio.
     */
    @is() @scope(world)
    public file?: string;

    /**
     * The date the audio was recorded.
     */
    @is() @scope(world) @specify(() => Date)
    public date?: Date;

    /**
     * The user from which the audio was recorded.
     */
    @is() @scope(world)
    public user?: DatabaseUser;

    /**
     * The id of the cached audio.
     */
    @scope(world) @is().validate(uuid)
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
