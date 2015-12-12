/*
 * Imports
 */
import User from "./user"
import Winston from "winston";
import Util from "util";
import EventEmitter from "events";

/*
 * Code
 */

/**
 * This class handles voice input for all users. It uses instances of user.js
 * and handles them.
 */
class VoiceInput extends EventEmitter {
	/**
		* @constructor
		* @param {Bot} bot - Instance of the bot this belongs to.
		*/
	constructor(bot) {
		super();
		this.bot = bot;
		this.users = {};
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
		for(const i of users) {
			this._addUser(users[i]);
		}
	}

	/**
	 * @param {MumbleUser} user - The mumble user object.
	 * @param {DatabaseUser} databaseUser - The user object from the database.
	 * @returns {undefined}
	 */
	_addRegisteredUser(user, databaseUser) {
		Winston.info("Input registered for user " + user.name);
		const localUser = new User(user, databaseUser, this.bot);
		this.users[user.id] = localUser;
		const stream = user.outputStream(true);
		stream.pipe(localUser);
	}

	/**
	 * Called when a user joined the server, or was there before the bot joined.
	 * @param {MumbleUser} user - The user who should be registered.
	 * @returns {undefined}
	 */
	_addUser(user) {
		this.bot.database.getLinkedUser(user.id, (err, databaseUser) => {
			if(err) {
				Winston.error("Error occured when trying to fetch user by mumble id", err);
			}
			if(!databaseUser) {
				Winston.info("Did not register input for user " + user.name
					+ " as this user is not linked to any database user.");
				return;
			}
			if(databaseUser.settings.record !== true) {
				Winston.info("Did not register input for user " + user.name
					+ " as this user does not want to be recorded.");
				return;
			}
			this._addRegisteredUser(user, databaseUser);
		});
	}

	/**
	 * Called when user disconnects. Unregisters the user.
	 * @param {TODO} user - The user which disconnected.
	 * @returns {undefined}
	 */
	_removeUser(user) {
		Winston.info("Input stopped for user " + user.name);
		delete this.users[user.id];
	}
}


module.exports = VoiceInput;
