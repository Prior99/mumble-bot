import { component, initialize, inject } from "tsdi";
import { Connection as MumbleConnection} from "mumble";
import { Connection as DbConnection } from "typeorm";
import { error } from "winston";
import { writeFile, unlink, readFile } from "async-file";
import { EventEmitter } from "events";

import { Output } from "./output";
import { MetaInformation, CachedAudio } from "../common";

@component
export class Bot extends EventEmitter {
    @inject private mumble: MumbleConnection;
    @inject private db: DbConnection;

    public output: Output;

    @initialize
    private initialize() {
        this.output = new Output(this);
    }

    /**
     * Returns only those users which have a unique id and are thous registered on
     * the mumble server.
     */
    // TODO: Move into utility.
    public getRegisteredMumbleUsers() {
        return this.mumble.users().filter(user => typeof user.id !== "undefined");
    }

    /**
     * Instantly shutdown everything which could cause noises.
     */
    public beQuiet() {
        this.output.clear();
    }

    /**
     * Gently shutdown the whole bot.
     */
    public async shutdown() {
        try {
            this.beQuiet();
            this.output.stop();
            this.emit("shutdown");
        }
        catch (err) {
            error("Error during shutdown:", err);
        }
    }

    /**
     * Will return whether the bot is busy speaking or listening to anyone.
     * @return If the bot is busy speaking or listening
     */
    public busy(): boolean {
        return this.output.busy;
    }

    /**
     * Plays a sound in the mumble server.
     * @param filename Filename of the soundfile to play. Must be a mono-channel 48,000Hz WAV-File
     * @param meta Metadata passed to the output module.
     * @param pitch The pitch to which the audio should be transformed.
     */
    public async playSound(filename: string, meta: MetaInformation, pitch = 0): Promise<void> {
        await this.output.playSound(filename, meta, pitch);
    }

    /**
     * Makes the bot join a specific channel in mumble.
     * @param cname Name of the channel to join.
     */
    public join(cname: string) {
        try {
            const channel = this.mumble.channelByName(cname);
            if (!channel) {
                error(`Channel "${cname}" is unknown.`);
                return;
            }
            channel.join();
        }
        catch (err) {
            error(`Unable to join channel "${cname}":`, err);
        }
    }
}
