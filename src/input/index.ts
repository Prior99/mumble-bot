import { VoiceInputUser } from "./user"
import * as Winston from "winston";
import { EventEmitter } from "events";
import { Bot } from "..";
import { getLinkedUser } from "../database";

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

    /**
     * @constructor
     * @param {Bot} bot - Instance of the bot this belongs to.
     */
    constructor(bot) {
        super();
        this.bot = bot;
        this._initConnectedUsers(bot.mumble.users());
        bot.mumble.on("user-connect", this._addUser.bind(this));
        bot.mumble.on("user-disconnect", this._removeUser.bind(this));
        Winston.info("Module started: Voice input");
    }

    /**
     * Registers all connected users as VoiceInputs
     * @param {MumbleUser[]} users - The corrently connected users . TODO fix type
     * @returns {undefined}
     */
    _initConnectedUsers(users) {
        for (const i in users) {
            if (users.hasOwnProperty(i)) {
                this._addUser(users[i]);
            }
        }
    }

    /**
     * Creates a local user object handling the data received from the mumble user of a registered user.
     * @param {MumbleUser} user - The mumble user object.
     * @param {DatabaseUser} databaseUser - The user object from the database.
     * @returns {undefined}
     */
    _addRegisteredUser(user, databaseUser) {
        Winston.info("Input registered for user " + user.name);
        const localUser = new VoiceInputUser(user, databaseUser, this.bot);
        this.users[user.id] = localUser;
        const stream = user.outputStream(true);
        stream.pipe(localUser);
    }

    /**
     * Called when a user joined the server, or was there before the bot joined.
     * @param {MumbleUser} user - The user who should be registered.
     * @returns {undefined}
     */
    async _addUser(user) {
        try {
            const databaseUser = await getLinkedUser(user.id, this.bot.database);
            if (!databaseUser) {
                Winston.info("Did not register input for user " + user.name
                    + " as this user is not linked to any database user.");
                return;
            }
            if (databaseUser.settings.record !== true) {
                Winston.info("Did not register input for user " + user.name
                    + " as this user does not want to be recorded.");
                return;
            }
            this._addRegisteredUser(user, databaseUser);
        }
        catch (err) {
            Winston.error("Error occured when trying to fetch user by mumble id", err);
        }
    }

    /**
     * Called when user disconnects. Unregisters the user.
     * @param {VoiceInputUser} user - The user which disconnected.
     * @returns {undefined}
     */
    _removeUser(user) {
        const localUser = this.users[user.id];
        if (localUser) {
            this.users[user.id].stop();
            delete this.users[user.id];
        }
    }

    /**
     * Stop all timeouts and shutdown everything.
     * @return {undefined}
     */
    stop() {
        for (const u in this.users) {
            if (this.users.hasOwnProperty(u)) {
                const user = this.users[u];
                user.stop();
            }
        }
        Winston.info("Input stopped.");
    }
}
