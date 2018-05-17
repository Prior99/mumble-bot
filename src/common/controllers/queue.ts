import {
    context,
    body,
    controller,
    route,
    created,
    internalServerError,
    badRequest,
} from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";
import { verbose } from "winston";
import { AudioOutput, AudioCache } from "../../server";
import { Sound, QueueItem, Playlist } from "../models";
import { world, enqueue } from "../scopes";
import { Context } from "../context";

@controller @component
export class Queue {
    @inject("AudioOutput") private audioOutput: AudioOutput;
    @inject("AudioCache") private audioCache: AudioCache;
    @inject private db: Connection;

    @route("POST", "/queue").dump(QueueItem, world)
    public async enqueue(@body(enqueue) queueItem: QueueItem, @context ctx?: Context): Promise<{}> {
        switch (queueItem.type) {
            case "sound":
                if (!queueItem.sound) {
                    return badRequest<QueueItem>(`Must specify "sound" if type is set to "sound".`);
                }
                const sound = await this.db.getRepository(Sound).findOne(queueItem.sound.id);
                if (!sound) {
                    return badRequest<QueueItem>(`No sound with id "${queueItem.sound.id}".`);
                }
                sound.used++;
                await this.db.getRepository(Sound).save(sound);
                break;
            case "cached audio":
                if (!queueItem.cachedAudio) {
                    return badRequest<QueueItem>(`Must specify "CachedAudio" if type is set to "cached audio".`);
                }
                if (!this.audioCache.hasId(queueItem.cachedAudio.id)) {
                    return badRequest<QueueItem>(`No cached audio with id "${queueItem.cachedAudio.id}".`);
                }
                break;
            case "playlist":
                if (!queueItem.playlist) {
                    return badRequest<QueueItem>(`Must specify "playlist" if type is set to "playlist".`);
                }
                const playlist = await this.db.getRepository(Playlist).findOne(queueItem.playlist.id);
                if (!playlist) {
                    return badRequest<QueueItem>(`No playlist with id "${queueItem.playlist.id}".`);
                }
                playlist.used++;
                await this.db.getRepository(Playlist).save(playlist);
                break;
            default:
                return internalServerError<QueueItem>();
        }
        const currentUser = await ctx.currentUser();
        queueItem.created = new Date();
        queueItem.user = currentUser;

        this.audioOutput.enqueue(queueItem);
        verbose(`User ${currentUser.name} enqueued ${queueItem.type} #${queueItem.relevantId}.`);

        return created(queueItem);
    }
}
