import { component, inject, initialize, destroy } from "tsdi";
import { VoiceInputUser } from "./user";
import { info } from "winston";
import { EventEmitter } from "events";
import { User as MumbleUser, Connection as MumbleConnection } from "mumble";
import { Connection as DatabaseConnection } from "typeorm";

import { User, MumbleLink } from "../../common";

/**
 * This class handles voice input for all users. It uses instances of user.js
 * and handles them.
 */
@component
export class AudioInput extends EventEmitter {
    @inject private mumble: MumbleConnection;
    @inject private db: DatabaseConnection;
    private users = new Map<number, VoiceInputUser>();

    @initialize
    private initConnectedUsers() {
        this.mumble.on("user-connect", this.addUser);
        this.mumble.on("user-disconnect", this.removeUser);
        this.mumble.users().forEach(user => this.addUser(user));
    }

    /**
     * Creates a local user object handling the data received from the mumble user of a registered user.
     * @param user The mumble user object.
     * @param databaseUser The user object from the database.
     */
    private async addRegisteredUser(user: MumbleUser, databaseUser: User) {
        info(`Input registered for user ${user.name}`);
        const localUser = new VoiceInputUser(user, databaseUser);
        await localUser.init();
        this.users.set(user.id, localUser);
        user.outputStream(true).pipe(localUser);
    }

    /**
     * Called when a user joined the server, or was there before the bot joined.
     * @param user The user who should be registered.
     */
    private async addUser(user: MumbleUser) {
        const link = await this.db.getRepository(MumbleLink).findOne({
            where: { mumbleId: user.id },
            relations: ["user"],
        });
        if (!link) {
            info(`Did not register input for user ${user.name} as this user is not linked to any database user.`);
            return;
        }
        this.addRegisteredUser(user, link.user);
    }

    /**
     * Called when user disconnects. Unregisters the user.
     * @param user The user which disconnected.
     */
    private removeUser(user: MumbleUser) {
        const localUser = this.users[user.id];
        if (localUser) {
            this.users[user.id].stop();
            delete this.users[user.id];
        }
    }

    /**
     * Stop all timeouts and shutdown everything.
     */
    @destroy
    public stop() {
        this.users.forEach(user => user.stop());
        info("Input stopped.");
    }
}
