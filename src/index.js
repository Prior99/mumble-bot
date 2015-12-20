/*
 * Imports
 */
import Util from "util";
import Input from "./input";
import Command from "./command";
import Output from "./output";
import Music from "./music";
import MPDControl from "./mpdcontrol";
import Winston from "winston";
import Website from "./website";
import Readline from "readline";
import Quotes from "./quotes";
import FS from "fs-promise";
import Steam from "./steam";
import EventEmitter from "events";
import Permissions from "./permissions";
import AFKObserver from "./afkobserver";
import RSS from "./rss";

const AUDIO_CACHE_AMOUNT = 4;

/**
 * A callback without any parameters.
 * @callback VoidCallback
 */

/**
 * A user from the Mumble server. Refer to documentation of node-mumble.
 * @typedef {object} MumbleUser
 */

/**
 * This is the main class of the bot instanciated from the loader and holding all relevant data,
 * systems and connections.
 */
class Bot extends EventEmitter {
	/**
	 * This is the constructor of the bot.
	 * @constructor
	 * @param {MumbleConnection} mumble - already set up mumble connection (MumbleClient)
	 * @param {Config} options - Options read from the config.json
	 * @param {Database} database - Started connection to database.
	 */
	constructor(mumble, options, database) {
		super();
		this.options = options;
		this.mumble = mumble;
		this.database = database;
		this.commands = [];
		this.cachedAudios = [];
		this._audioId = 0;

		this.command = new Command(this);
		this.quotes = new Quotes(this);
		this.permissions = new Permissions(database);

		this._inputStream = mumble.inputStream();

		this.website = new Website(this);

		this._initChatInput();
		this._initPromptInput();

		this.output = new Output(this);
		if(options.audioCacheAmount) {
			this.audioCacheAmount = options.audioCacheAmount;
		}
		else {
			this.audioCacheAmount = AUDIO_CACHE_AMOUNT;
		}

		if(options.mpd) {
			if(options.mpd.fifo) {
				this.music = new Music(this);
				this.output.on("start", this.music.mute.bind(this.music));
				this.output.on("stop", this.music.unmute.bind(this.music));
			}
			this.mpd = new MPDControl(this);
		}

		if(options.steam) {
			this.steam = new Steam(this, options.steam);
		}

		if(options.rss) {
			this.rss = new RSS(this);
		}

		this.afkObserver = new AFKObserver(this);
		this._init();
	}
	/**
	 * Register commands and listeners and load all addons.
	 * @return {undefined}
	 */
	async _init() {
		await this._loadAddons("addons/");

		this.input = new Input(this);
		this.input.on("input", (text, user) => {
			this._onVoiceInput(text, user);
		});

		this.mumble.on("user-connect", this.handleUserConnect);
		this.newCommand("help", () => {
			const help = "Hilfe. Du musst mich mit meinem hot Word ansprechen. Mein hot Word ist: \""
				+ this.hotword + "\". Um eine Liste aller Kommandos zu erhalten, sag: \""
				+ this.hotword + " commands\"";
			this.say(help);
		}, "Gibt einen Hilfetext aus.", "info");
		this.newCommand("commands", () => {
			let cmdSay = "Ich kenne die folgenden Kommandos ";
			let cmdWrite = "Ich kenne die folgenden Kommandos:<br>";
			for(const key in this.command.commands) {
				if(this.command-commands.hasOwnProperty(key)) {
					cmdSay += key + ",";
					cmdWrite += "  * " + key + "<br>";
				}
			}
			this.say(cmdSay + ". Ich habe diese Liste auch in den Chat geschrieben.");
			this.mumble.user.channel.sendMessage(cmdWrite.substring(0, cmdWrite.length - 4));
		}, "Gibt eine Liste aller Kommandos aus.", "list-ul");
		this.newCommand("be quiet", this.beQuiet, "Sofort alles, was Geräusche verursacht abschalten.",
			"bell-slash", null, "be-quiet");
		this.newCommand("shutdown", this.shutdown, "Fährt den bot herunter.", "power-off", null, "shutdown");
		this.mumble.users().forEach(this._addEventListenersToMumbleUser);
	}

	/**
	 * Returns only those users which have a unique id and are thous registered on
	 * the mumble server.
	 * @returns {undefined}
	 */
	getRegisteredMumbleUsers() {
		const users = this.mumble.users();
		const result = [];
		for(const i in users) {
			if(users[i].id) {
				result.push(users[i]);
			}
		}
		return result;
	}

	/**
	 * <b>Async</b> Handles the connection for a user in the mumble server.
	 * Looks up the user in the database and registers the respective handlers.
	 * @param {MumbleUser} user - The user connected to the server.
	 * @return {undefined}
	 */
	async handleUserConnect(user) {
		try {
			const dbUser = await this.database.getLinkedUser(user.id);
			if(dbUser) {
				const announce = this.options.announce;
				if(!announce || (announce.connect !== false && announce.connect !== "false")) {
					this.sayImportant(dbUser.username + " hat als " + user.name
						+ " Mumble betreten.");
				}
			}
			else {
				if(!announce || (announce.connect !== false && announce.connect !== "false")) {
					this.sayImportant("Unbekannter Nutzer " + user.name
						+ " hat Mumble betreten.");
					this.notifyOnlineUsersWithPermission("grant", "Ein unbekannter Nutzer "
						+ "mit Namen \"" + user.name + "\" hat soeben Mumble betreten.");
					user.sendMessage("Herzlich Willkommen. Ich bin " + this.options.name + ". "
						+ "Es sollte ein Administrator kommen und dich begrüßen. "
						+ "In der Zwischenzeit kannst du dir unter "
						+ this.options.webpageurl + " einen Account anlegen.");
				}
				if(this.options.kickChannel) {
					user.moveToChannel(this.options.publicChannel);
				}
			}
		}
		catch(err) {
			Winston.error("Unable to fetch mumble user linkage.", err);
		}
		this._addEventListenersToMumbleUser(user);
	}

	/**
	 * Registers the event listeners for one mumble user.
	 * @param {MumbleUser} user - The user to register the event listeners for.
	 * @return {undefined}
	 */
	_addEventListenersToMumbleUser(user) {
		user.on("disconnect", () => {
			const announce = this.options.announce;
			if(!announce || (announce.disconnect !== false && announce.disconnect !== "false")) {
				this.sayImportant(user.name + " hat Mumble verlassen");
			}
		});
		user.on("move", (oldChan, newChan, actor) => {
			if(!announce || (announce.move !== false && announce.move !== "false")) {
				this.sayImportant(user.name + " ging von Channel " + oldChan.name
					+ " nach " + newChan.name);
			}
		});
	}

	/**
	 * <b>Async</b> Sends a notification to users in the mumble that have the required permission.
	 * @param {string} permission - The permission required to receive the message.
	 * @param {string} message - The message to send.
	 * @return {undefined}
	 */
	async notifyOnlineUsersWithPermission(permission, message) {
		try {
			const users = await this.database.listUsers();
			for(const potential of users) {
				const has = await this.permissions.hasPermission(potential, permission);
				if(has) {
					try {
						const ids = await this.database.getLinkedMumbleUsersOfUser(potential.username);
						for(id of ids) {
							const mumbleUser = this.mumble.userById(id.id);
							if(mumbleUser) {
								mumbleUser.sendMessage(message);
							}
						}
					}
					catch(err) {
						Winston.error("Unable to get linked mumble users of user "
							+ potential.username, err);
					}
				}
			}
		}
		catch(err) {
			Winston.error("Unable to list users.", err);
		}
	}

	/**
	 * <b>Async</b> Callback method called when voice (speech recognition) is emitted from a user in the mumble.
	 * @param {string} text - The text from the speech recognition parsed from what the user said.
	 * @param {MumbleUser} mumbleUser - The user the speech came from.
	 * @return {undefined}
	 */
	async _onVoiceInput(text, mumbleUser) {
		try {
			const user = await this.database.getLinkedUser(mumbleUser.id);
			this.command.processPrefixed(text, "mumble", user);
		}
		catch(err) {
			Winston.error("Error fetching user by mumble user id.", err);
		}
	}

	/**
	 * Instantly shutdown everything which could cause noises.
	 * @return {undefined}
	 */
	beQuiet() {
		this.output.clear();
	}

	/**
	 * <b>Async</b> Gently shutdown the whole bot.
	 * @return {undefined}
	 */
	async shutdown() {
		await this.say("Herunterfahren initiiert.");
		this._deleteAllCachedAudio(0);
		await this.website.shutdown();
		if(this.steam) {
			this.steam.stop();
		}
		if(this.minecraft) {
			this.minecraft.stop();
		}
		if(this.mpd) {
			this.mpd.stop();
		}
		if(this.music) {
			this.music.stop();
		}
		this.emit("shutdown");
	}

	/**
	 * Initializes the input from the prompt.
	 * @return {undefined}
	 */
	_initPromptInput() {
		this._rlStdin = Readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		this._rlStdin.on("SIGINT", () => {
			this.emit("SIGINT");
		});
		this._rlStdin.on("line", (line) => {
			this.command.process(line, "terminal", null);
		});
	}

	/**
	 * Initializes the input from the chat of the mumble server.
	 * @return {undefined}
	 */
	_initChatInput() {
		this.mumble.on("message", async (message, mumbleUser, scope) => {
			try {
				const user = await this.database.getLinkedUser(mumbleUser.id);
				this.command.process(message, "mumble", user);
			}
			catch(err) {
				Winston.error("Error fetching user by mumble user id.", err);
			}
		});
	}

	/**
	 * <b>Async</b> Loads the addons from a specified directory.
	 * @param {string} dir - Directory to load the addons from.
	 * @param {VoidCallback} callback - Called when all addons were loaded.
	 * @return {undefined}
	 */
	async _loadAddons(dir, callback) {
		try {
			const stats = await FS.stat(dir);
			if(!stats.isDirectory()) {
				Winston.warn(dir + " is not a directory");
			}
			else {
				try {
					const files = await FS.readdir(dir);
					for(const file of files) {
						const filename = dir + file;
						if(FS.lstatSync(filename).isDirectory() && file.substr(0, 1) !== ".") {
							Winston.info("Loading addon " + filename + " ...");
							const addon = require("../" + filename);
							await addon(this);
						}
					}
					return;
				}
				catch(err) {
					Winston.error("Error loading addons!");
					throw err;
				}
			}
		}
		catch(err) {
			Winston.warn("Cannot access directory " + dir);
		}
	}

	/**
	 * Will return whether the bot is busy speaking or listening to anyone.
	 * @return {Boolean} - If the bot is busy speaking or listening
	 */
	busy() {
		return this.output.busy || this.input.busy;
	}

	/**
	 * Plays a sound in the mumble server.
	 * @param {string} filename - Filename of the soundfile to play. Must be a mono-channel 48,000Hz WAV-File
	 * @return {undefined}
	 */
	async playSound(filename) {
		await this.output.playSound(filename);
	}

	/**
	 * Will start echoing everything a user says.
	 * This method is used so that anyone can hear which voice-command
	 * is currently given to the bot and not just the bleeep and bloop sounds.
	 * @param {MumbleUser} user - mumble user to start piping.
	 * @return {undefined}
	 */
	startPipingUser(user) {
		//console.log("Piping started");
		if(this.music) {
			this.music.mute();
		}
		this._pipeUserEvent = (chunk) => {
			this._inputStream.write(chunk);
		};
		this._pipeUserStream = user.outputStream(true);
		this._pipeUserStream.on("data", this._pipeUserEvent);
	}

	/**
	 * Stop echoing the user which is currently being echoed.
	 * @return {undefined}
	 */
	stopPipingUser() {
		//console.log("Piping stopped");
		if(this.music) {
			this.music.unmute();
		}
		this._pipeUserStream.removeListener("data", this._pipeUserEvent);
		this._pipeUserStream = undefined;
		this._pipeUserEvent = undefined;
	}

	/**
	 * Called when a registered command was executed. The arguments are the arguments passwd to the
	 * command when called as well as the way the command was received (console, chat, steam, etc...) and
	 * the user that invoked the command.
	 * @callback CommandCallback
	 */
	/**
	 * This is one of the most important methods in the bot.
	 * This method registers a new command in the bot.
	 * @param {string} commandName - Name of the command to create
	 * @param {CommandCallback} method - Method which will be executed when the command was called
	 * @param {string} description - Description of the command as displayed on the website
	 * @param {string} icon - [Name of a Fontawesome-icon to display.](http://fortawesome.github.io/Font-Awesome/icons/)
	 * @param {string[]} args - (Optional) Array of possible arguments.
	 * @param {string} permission - (Optional) permission needed to execute this command.
	 * @return {undefined}
	 */
	newCommand(commandName, method, description, icon, args, permission) {
		if(!args) {
			args = [];
		}
		this.command.newCommand(commandName, method, args, permission);
		this.commands.push({
			name : commandName,
			description,
			icon,
			arguments : args,
			permission,
			hasArguments : args.length > 0
		});
	}

	/**
	 * Makes the bot join a specific channel in mumble.
	 * @param {string} cname - Name of the channel to join.
	 * @return {undefined}
	 */
	join(cname) {
		const channel = this.mumble.channelByName(cname);
		channel.join();
	}

	/**
	 * Add an audio file to the list of cached audios.
	 * @param {string} filename - Filename of the cached audio file.
	 * @param {DatabaseUser} user - User that emitted the audio.
	 * @param {number} duration - Duration of the audio.
	 * @return {undefined}
	 */
	addCachedAudio(filename, user, duration) {
		const obj = {
			file : filename,
			date : new Date(),
			user,
			id : this._audioId++,
			duration,
			protected : false
		};
		this.cachedAudios.push(obj);
		this.emit("cached-audio", obj);
		this._clearUpCachedAudio();
	}

	/**
	 * A cached audio.
	 * @typedef {object} CachedAudio
	 * @property {string} file - The filename of the audio.
	 * @property {date} date - The date the audio was recorded.
	 * @property {DatabaseUser} user - The user from which the audio was recorded.
	 * @property {number} id - The id of the cached audio.
	 * @property {number} duration - The duration of the audio in seconds.
	 * @property {boolean} protected - Whether the audio was protected by someone or not.
	 */

	/**
	 * Retrieve the cached audio by its id. Returns the audio when the id was valid
	 * and null otherwise.
	 * @param {number} id - Id of the audio to look up.
	 * @return {CachedAudio} - The cached audio or null when the id was invalid.
	 */
	getCachedAudioById(id) {
		for(const key in this.cachedAudios) {
			if(this.cachedAudios.hasOwnProperty(key)) {
				const audio = this.cachedAudios[key];
				if(audio.id === id) {
					return audio;
				}
			}
		}
		return null;
	}

	/**
	 * Protected the cached audio with the given id.
	 * @param {number} id - Id of the audio to protect.
	 * @return {boolean} - False when the id was invalid.
	 */
	protectCachedAudio(id) {
		const elem = this.getCachedAudioById(id);
		if(!elem) {
			return false;
		}
		else {
			elem.protected = true;
			this.emit("protect-cached-audio", elem);
			return true;
		}
	}

	/**
	 * Removes the cached audio with the given id.
	 * @param {number} id - Id of the audio to remove.
	 * @return {boolean} - False when the id was invalid.
	 */
	removeCachedAudioById(id) {
		const elem = this.getCachedAudioById(id);
		if(!elem) {
			return false;
		}
		else {
			this.removeCachedAudio(elem);
			return true;
		}
	}

	/**
	 * Removes the cached audio by audio object.
	 * @param {CachedAudio} audio - audio object to remove.
	 * @return {boolean} - False when the id was invalid.
	 */
	removeCachedAudio(audio) {
		const index = this.cachedAudios.indexOf(audio);
		if(index !== -1) {
			this.cachedAudios.splice(index, 1);
			this.emit("removed-cached-audio", audio);
			return true;
		}
		else {
			return false;
		}
	}

	/**
	 * Clears up the list of cached audios and keeps it to the specified maximum size.
	 * @return {undefined}
	 */
	_clearUpCachedAudio() {
		this._deleteAllCachedAudio(this.audioCacheAmount);
	}

	/**
	 * Delete the specified amount of audios from the list of cached audios starting with the oldest
	 * and skipping protected audios.
	 * @param {number} amount - AMount of audios to remove.
	 * @return {undefined}
	 */
	_deleteAllCachedAudio(amount) {
		const prot = [];
		while(this.cachedAudios.length > amount) {
			const elem = this.cachedAudios.shift();
			if(elem.protected) {
				amount --;
				prot.push(elem);
			}
			else {
				try {
					FS.unlinkSync(elem.file);
					this.emit("removed-cached-audio", elem);
					Winston.info("Deleted cached audio file " + elem.file + ".");
				}
				catch(err) {
					Winston.error("Error when cleaning up cached audios!", err);
				}
			}
		}
		while(prot.length > 0) {
			this.cachedAudios.unshift(prot.pop());
		}
	}

	/**
	 * <b>Async</b> Will say something. The text will be played in mumble using TTS, written to
	 * the bots current channel (theoretically) and written in minecraft.
	 * @param {string} text - Text to say.
	 * @param {VoidCallback} cb - Callback, will be called *after playback of TTS has finished.
	 * @return {undefined}
	 */
	async sayOnlyVoice(text, cb) {
		await this.output.sayOnlyVoice(text, cb);
	}

	/**
	 * <b>Async</b> Will say something. The text will be played in mumble using TTS, written to
	 * the bots current channel (theoretically) and written in minecraft.
	 * @param {string} text - Text to say.
	 * @param {VoidCallback} cb - Callback, will be called *after playback of TTS has finished.
	 * @return {undefined}
	 */
	async say(text, cb) {
		const s = await this.output.say(text, cb);
		return s;
	}

	/**
	 * <b>Async</b> Say something important. Other than the normal say method this will also say
	 * the shit in steam.
	 * @param {string} text - Text to say.
	 * @param {VoidCallback} cb - Callback, will be called *after playback of TTS has finished.
	 * @return {undefined}
	 */
	async sayImportant(text, cb) {
		if(this.steam) {
			this.steam.broadcast(text);
		}
		const s = await this.say(text, cb);
		return s;
	}

	/**
	 * <b>Async</b> Report an error by saying it.
	 * @param {string} text - Message of the error to report.
	 * @return {undefined}
	 */
	async sayError(text) {
		const s = await this.output.say("Error:    " + text);
		return s;
	}

	/**
	 * Find all users in mumble which contain the supplied string in their name.
	 * For example: ```bot.findUsers("merlin");``` will find "Merlin | LÖML | Mörrrlin".
	 * This method is used in *certain* methods.
	 * @param {string} namePart - Text to search for.
	 * @return {undefined}
	 */
	findUsers(namePart) {
		namePart = namePart.toLowerCase();
		const users = this.mumble.users();
		const found = [];
		for(const key in users) {
			if(users.hasOwnProperty(key)) {
				const user = users[key];
				if(user.name.toLowerCase().indexOf(namePart) !== -1) {
					found.push(user);
				}
			}
		}
		return found;
	}
}

export default Bot;
