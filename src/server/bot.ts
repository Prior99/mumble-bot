import { component, initialize, inject } from "tsdi";
import { Connection as MumbleConnection} from "mumble";
import { Connection as DbConnection } from "typeorm";
import { error } from "winston";
import { writeFile, unlink, readFile } from "async-file";
import { EventEmitter } from "events";

import { MetaInformation, CachedAudio } from "../common";

@component
export class Bot extends EventEmitter {
    @inject private mumble: MumbleConnection;
    @inject private db: DbConnection;

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
            this.emit("shutdown");
        }
        catch (err) {
            error("Error during shutdown:", err);
        }
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
