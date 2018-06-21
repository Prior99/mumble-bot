import { is, DataType, oneOf, required, scope, specify } from "hyrest";
import { Sound } from "./sound";
import { CachedAudio } from "./cached-audio";
import { Playlist, User } from ".";
import { enqueue, world, live } from "../scopes";

export class QueueItem {
    @is(DataType.int) @scope(enqueue, world, live)
    public pitch = 0;

    @is(DataType.int) @scope(enqueue, world, live)
    public echo = 0;

    @is(DataType.str).validate(required, oneOf("sound", "cached audio", "playlist")) @scope(enqueue, world, live)
    public type: "sound" | "cached audio" | "playlist";

    @is() @scope(enqueue, world, live) @specify(() => Sound)
    public sound?: Sound;

    @is() @scope(enqueue, world, live)
    public cachedAudio?: CachedAudio;

    @is() @scope(enqueue, world, live) @specify(() => Playlist)
    public playlist?: Playlist;

    @is() @scope(world, live) @specify(() => User)
    public user?: User;

    @is() @scope(world, live)
    public created?: Date;

    public get relevantId() {
        switch (this.type) {
            case "sound": return this.sound.id;
            case "cached audio": return this.cachedAudio.id;
            case "playlist": return this.playlist.id;
            default: return undefined;
        }
    }

    public get duration() {
        switch (this.type) {
            case "sound": return this.sound.duration;
            case "cached audio": return this.cachedAudio.duration;
            case "playlist": return this.playlist.duration;
            default: return 0;
        }
    }
}
