import { VoiceInputUser } from "./user";
import * as Winston from "winston";
import { EventEmitter } from "events";
import { Bot } from "..";
import { getLinkedUser } from "../database";
import { User as MumbleUser } from "mumble";
import { DatabaseUser } from "../models";

interface UserMap {
    [id: string]: VoiceInputUser;
}

/**
 * This class handles voice input for all users. It uses instances of user.js
 * and handles them.
 */
export class VoiceInput extends EventEmitter {
    private bot: Bot;
    private users: UserMap = {};

    constructor(bot: Bot) {
        super();
        this.bot = bot;
        this.initConnectedUsers(bot.mumble.users());
        bot.mumble.on("user-connect", this.addUser.bind(this));
        bot.mumble.on("user-disconnect", this.removeUser.bind(this));
        Winston.info("Module started: Voice input");
    }

    /**
     * Registers all connected users as VoiceInputs
     * @param users The corrently connected users . TODO fix type
     */
    private initConnectedUsers(users: MumbleUser[]) {
        users.forEach(user => this.addUser(user));
    }

    /**
     * Creates a local user object handling the data received from the mumble user of a registered user.
     * @param user The mumble user object.
     * @param databaseUser The user object from the database.
     */
    private async addRegisteredUser(user: MumbleUser, databaseUser: DatabaseUser) {
        Winston.info("Input registered for user " + user.name);
        const localUser = new VoiceInputUser(user, databaseUser, this.bot);
        await localUser.init();
        this.users[user.id] = localUser;
        const stream = user.outputStream(true);
        stream.pipe(localUser);
    }

    /**
     * Called when a user joined the server, or was there before the bot joined.
     * @param user The user who should be registered.
     */
    private async addUser(user: MumbleUser) {
        try {
            const databaseUser = await getLinkedUser(user.id, this.bot.database);
            if (!databaseUser) {
                Winston.info(
                    `Did not register input for user ${user.name} as this user is not linked to any database user.`
                );
                return;
            }
            this.addRegisteredUser(user, databaseUser);
        }
        catch (err) {
            Winston.error("Error occured when trying to fetch user by mumble id", err);
        }
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
    public stop() {
        Object.keys(this.users).map(key => this.users[key]).forEach(user => user.stop());
        Winston.info("Input stopped.");
    }
}
