import { is, DataType, oneOf, required, scope } from "hyrest";
import { Sound } from "./sound";
import { CachedAudio } from "./cached-audio";
import { Playlist } from "./playlist";
import { User } from "./user";
import { enqueue, world } from "../scopes";

export class QueueItem {
    @is(DataType.float) @scope(enqueue, world)
    public pitch = 0;

    @is(DataType.str).validate(required, oneOf("sound", "cached audio", "playlist")) @scope(enqueue, world)
    public type: "sound" | "cached audio" | "playlist";

    @is() @scope(enqueue, world)
    public sound?: Sound;

    @is() @scope(enqueue, world)
    public cachedAudio?: CachedAudio;

    @is() @scope(enqueue, world)
    public playlist?: Playlist;

    @is() @scope(world)
    public user?: User;

    @is() @scope(world)
    public created?: Date;

    public get relevantId() {
        switch (this.type) {
            case "sound": return this.sound.id;
            case "cached audio": return this.cachedAudio.id;
            case "playlist": return this.playlist.id;
            default: return undefined;
        }
    }
}
