/*
 * Includes
 */
import * as Steam from "steam";
import * as Util from "util";
import EventEmitter from "events";
import Winston from "winston";
import * as FS from "fs";
import * as Readline from "readline";

/*
 * Code
 */

/**
 * Handles the bots connection to steam.
 * @constructor
 * @param {Bot} bot - Bot this instance was created in.
 * @param {object} options - Options to connect with, read from configfile.
 */
class SteamBot extends EventEmitter {
	/**
	 * @constructor
	 * @param {Bot} bot - The bot this instance belongs to.
	 * @param {object} options - The bots configuration for steam.
	 * @param {string} options.user - The username to connect with.
	 * @param {string} options.password - The password to use for authentication.
	 */
	constructor(bot, options) {
		super();
		this.bot = bot;
		this.options = {
			accountName : options.user,
			password : options.password
		};
		FS.readFile("steam-sentry-hash", (err, hash) => {
			if(err) {
				if(err.code !== "ENOENT") {
					throw err;
				}
				else {
					this._startUpSteamGuard();
				}
			}
			else {
				this.options.shaSentryfile = hash;
				this._startUp();
			}
		});
	}

	/**
	 * Set up steamguard. The code will be read from the commandline.
	 * @return {undefined}
	 */
	_startUpSteamGuard() {
		const rl = Readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			terminal: false
		});
		Winston.log("PLEASE ENTER YOUR STEAMGUARD CODE:"); // replaced console.log
		rl.on("line", code => {
			if(code.length > 0) {
				this.options.authCode = code;
			}
			else {
				Winston.warn("No steam guardcode supplied. You should receive an email now.");
			}
			this._startUp();
		});
	}

	/**
	 * <b>Async</b> Called when a chatmessage was received via steam.
	 * @param {string} message - The message that was received.
	 * @param {string} steamId - The SteamID of the user that sent us the message.
	 * @return {undefined}
	 */
	async _onMessage(message, steamId) {
		try {
			const user = await this.bot.database.getUserBySteamId(steamId);
			this.bot.command.process(message, "steam", user);
		}
		catch(err) {
			Winston("Error fetching user by steamid", err);
		}
	}

	/**
	 * Called when the login was done. Registeres all neccessary listeners.
	 * @return {undefined}
	 */
	_postLogin() {
		this.client.on("message", (source, message, type, chatter) => {
			if(type === Steam.EChatEntryType.ChatMsg) {
				this._onMessage(message, source);
			}
		});
		this.client.on("relationships", () => {
			this._hasFriends = true;
		});
		this.client.on("friend", (id, status) => {
			if(status === Steam.EFriendRelationship.RequestRecipient) {
				this.client.addFriend(id);
				this.client.once("user", friend => {
					this.bot.sayImportant("Ich bin auf Steam jetzt mit " + friend.playerName + " befreundet.");
				});
				this.client.requestFriendData(id);
			}
		});
		this.client.on("user", friend => {
			if(!this.client.users || !this.client.users[friend.friendid]) {
				return;
			}
			const fName = friend.playerName;
			const personaState = this.client.users[friend.friendid].personaState;
			if(friend.personaState === 1 && personaState === 0 && this._lastLoginAnnounced !== fName) {
				this.bot.say(fName + " hat sich in Steam angemeldet.");
				this._lastLoginAnnounced = fName;
			}
			else if(friend.personaState === 0 && personaState === 1 && this._lastLogoutAnnounced !== fName) {
				this.bot.say(fName + " hat sich in Steam abgemeldet.");
				this._lastLogoutAnnounced = fName;
			}
		});
	}

	/**
	 * Sends a message to all friends of this bot.
	 * @param {string} message - Message to send to all friends.
	 * @return {undefined}
	 */
	broadcast(message) {
		if(this._hasFriends) {
			for(const id in this.client.friends) {
				if(this.client.friends.hasOwnProperty(id)) {
					this.client.sendMessage(id, message, Steam.EChatEntryType.ChatMsg);
				}
			}
		}
	}

	/**
	 * Called when the conenction to steam was done. Performs the login.
	 * @return {undefined}
	 */
	_startUp() {
		Winston.info("Connecting to steam as " + this.options.accountName + " ... ");
		this.client = new Steam.SteamClient();
		this.client.logOn(this.options);
		this.client.on("loggedOn", () => {
			this.client.setPersonaState(Steam.EPersonaState.Online);
			Winston.info("Connected to Steam.");
			this._postLogin();
		});
		this.client.on("sentry", hash => {
			Winston.info("Saving steam sentry hash: " + hash + ".");
			FS.writeFileSync("steam-sentry-hash", hash);
		});
	}

	/**
	 * Disconnect from steam gently.
	 * @return {undefined}
	 */
	stop() {
		this.client.setPersonaState(Steam.EPersonaState.Offline);
		Winston.info("Disconnecting from steam ...");
		this.client.logOff();
	}
}

export default SteamBot;
