/*
 * Imports
 */
const Util = require("util");
import Input from "./input";
const Command = require("./command");
const Output = require("./output");
const Music = require("./music");
const MPDControl = require("./mpdcontrol");
const Winston = require("winston");
const Website = require("./website");
const Readline = require("readline");
const Quotes = require("./quotes");
const FS = require("fs");
const Steam = require("./steam");
const EventEmitter = require("events").EventEmitter;
const Permissions = require("./permissions");
const AFKObserver = require("./afkobserver");
const RSS = require("./rss");

const AUDIO_CACHE_AMOUNT = 4;

/**
 * TODO
 */
class Bot {
	/**
	 * This is the constructor of the bot.
	 * @constructor
	 * @param mumble - already set up mumble connection (MumbleClient)
	 * @param options - Options read from the config.json
	 * @param {Database} database - Started connection to database.
	 */
	constructor(mumble, options, database) {
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

		this._loadAddons("addons/", () => {
			//Must be run after all commands were registered
			this.input = new Input(this);
			this.input.on("input", (text, user) => {
				this._onVoiceInput(text, user);
			});
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
				cmdSay += key + ",";
				cmdWrite += "  * " + key + "<br>";
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

	handleUserConnect(user) {
		this.database.getLinkedUser(user.id, (err, dbUser) => {
			if(err) {
				Winston.error("Unable to fetch mumble user linkage.", err);
			}
			else {
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
		});
		this._addEventListenersToMumbleUser(user);
	}

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

	notifyOnlineUsersWithPermission(permission, message) {
		this.database.listUsers((err, users) => {
			if(err) {
				Winston.error("Unable to list users.", err);
			}
			else {
				users.forEach(potential => {
					this.permissions.hasPermission(potential, permission, has => {
						if(has) {
							this.database.getLinkedMumbleUsersOfUser(potential.username, (err, ids) => {
								if(err) {
									Winston.error("Unable to get linked mumble users of user "
										+ potential.username, err);
								}
								else {
									ids.forEach(id => {
										const mumbleUser = this.mumble.userById(id.id);
										if(mumbleUser) {
											mumbleUser.sendMessage(message);
										}
									});
								}
							});
						}
					});
				});
			}
		});
	}

	_onVoiceInput(text, mumbleUser) {
		this.database.getLinkedUser(mumbleUser.id, (err, user) => {
			if(err) {
				Winston.error("Error fetching user by mumble user id.", err);
			}
			else {
				this.command.processPrefixed(text, "mumble", user);
			}
		});
	}

	/**
	 * Instant shutdown everything which could cause noises.
	 */
	beQuiet() {
		this.output.clear();
	}

	/**
	 * Gently shutdown the whole bot.
	 */
	shutdown() {
		this.say("Herunterfahren initiiert.", () => {
			this._deleteAllCachedAudio(0);
			this.website.shutdown(() => {
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
			});
		});
	}

	_initPromptInput() {
		this._rlStdin = Readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		this._rlStdin.on("SIGINT", function() {
			this.emit("SIGINT");
		});
		this._rlStdin.on("line", function(line) {
			this.command.process(line, "terminal", null);
		});
	}

	_initChatInput() {
		this.mumble.on("message", function(message, mumbleUser, scope) {
			this.database.getLinkedUser(mumbleUser.id, function(err, user) {
				if(err) {
					Winston.error("Error fetching user by mumble user id.", err);
				}
				else {
					this.command.process(message, "mumble", user);
				}
			});
		});
	}

	_loadAddons(dir, callback) {
		FS.stat(dir, (err, stats) => {
			if(err || !stats.isDirectory()) {
				Winston.warn("Cannot access directory " + dir);
			}
			else {
				FS.readdir(dir, (err, files) => {
					if(err) {
						Winston.error("Error loading addons!");
						throw err;
					}
					else {
						const next = function() {
							if(files.length > 0) {
								const file = files.shift()
								const filename = dir + file;
								if(FS.lstatSync(filename).isDirectory() && file.substr(0, 1) !== ".") {
									Winston.info("Loading addon " + filename + " ...");
									const isAsync = require("../" + filename)(this, next);
									if(!isAsync) {
										next();
									}
								}
								else {
									next();
								}
							}
							else {
								callback();
							}
						};
						next();
					}
				});
			}
		});
	}

	/**
	 * Will return whether the bot is busy speaking or listening to anyone.
	 * @return If the bot is busy speaking or listening
	 */
	busy() {
		return this.output.busy || this.input.busy;
	}

	/**
	 * Plays a sound in the mumble server.
	 * @param {string} filename - Filename of the soundfile to play. Must be a mono-channel 48,000Hz WAV-File
	 * @param cb - Callback will be called when sound has finished playing
	 */
	playSound(filename, cb) {
		this.output.playSound(filename, cb);
	}

	/**
	 * Will start echoing everything a user says.
	 * This method is used so that anyone can hear which voice-command
	 * is currently given to the bot and not just the bleeep and bloop sounds.
	 * @param user - mumble user to start piping.
	 */
	startPipingUser(user) {
		//console.log("Piping started");
		if(this.music) {
			this.music.mute();
		}
		this._pipeUserEvent = function(chunk) {
			this._inputStream.write(chunk);
		};
		this._pipeUserStream = user.outputStream(true);
		this._pipeUserStream.on("data", this._pipeUserEvent);
	}

	/**
	 * Stop echoing the user which is currently being echoed.
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
	 * This is one of the most important methods in the bot.
	 * This method registers a new command in the bot.
	 * @param {string} commandName - Name of the command to create
	 * @param method - Method which will be executed when the command was called
	 * @param {string} description - Description of the command as displayed on the website
	 * @param {string} icon - [Name of a Fontawesome-icon to display.](http://fortawesome.github.io/Font-Awesome/icons/)
	 * @param {string[]} args - (Optional) Array of possible arguments.
	 * @param {string} permission - (Optional) permission needed to execute this command.
	 */
	newCommand(commandName, method, description, icon, args, permission) {
		if(!args) {
			args = [];
		}
		this.command.newCommand(commandName, method, args, permission);
		this.commands.push({
			name : commandName,
			description : description,
			icon : icon,
			arguments : args,
			permission : permission,
			hasArguments : args.length > 0
		});
	}

	/**
	 * Makes the bot join a specific channel in mumble.
	 * @param cname - Name of the channel to join.
	 */
	join(cname) {
		const channel = this.mumble.channelByName(cname);
		channel.join();
	}

	addCachedAudio(filename, user, duration) {
		var obj = {
			file : filename,
			date : new Date(),
			user : user,
			id : this._audioId++,
			duration : duration,
			protected : false
		};
		this.cachedAudios.push(obj);
		this.emit("cached-audio", obj);
		this._clearUpCachedAudio();
	}

	getCachedAudioById(id) {
		for(var key in this.cachedAudios) {
			var audio = this.cachedAudios[key];
			if(audio.id === id) {
				return audio;
			}
		}
		return null;
	}

	protectCachedAudio(id) {
		var elem = this.getCachedAudioById(id);
		if(!elem) {
			return false;
		}
		else {
			elem.protected = true;
			this.emit("protect-cached-audio", elem);
			return true;
		}
	}

	removeCachedAudioById(id) {
		var elem = this.getCachedAudioById(id);
		if(!elem) {
			return false;
		}
		else {
			this.removeCachedAudio(elem);
			return true;
		}
	}

	removeCachedAudio(audio) {
		var index = this.cachedAudios.indexOf(audio);
		if(index !== -1) {
			this.cachedAudios.splice(index, 1);
			this.emit("removed-cached-audio", audio);
			return true;
		}
		else {
			return false;
		}
	};

	_clearUpCachedAudio() {
		this._deleteAllCachedAudio(this.audioCacheAmount);
	}

	_deleteAllCachedAudio(amount) {
		let prot = [];
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
	 * Will say something. The text will be played in mumble using TTS, written to
	 * the bots current channel (theoretically) and written in minecraft.
	 * @param {string} text - Text to say.
	 * @param cb - Callback, will be called *after playback of TTS has finished*.
	 */
	sayOnlyVoice(text, cb) {
		return this.output.sayOnlyVoice(text, cb);
	}

	/**
	 * Will say something. The text will be played in mumble using TTS, written to
	 * the bots current channel (theoretically) and written in minecraft.
	 * @param {string} text - Text to say.
	 * @param cb - Callback, will be called *after playback of TTS has finished*.
	 */
	say(text, cb) {
		return this.output.say(text, cb);
	}

	/**
	 * Say something important. Other than the normal say method this will also say
	 * the shit in steam.
	 * @param {string} text - Text to say.
	 * @param cb - Callback, will be called *after playback of TTS has finished*.
	 */
	sayImportant(text, cb) {
		if(this.steam) {
			this.steam.broadcast(text);
		}
		return this.say(text, cb);
	}

	/**
	 * Report an error by saying it.
	 * @param {string} text - Message of the error to report.
	 */
	sayError(text) {
		return this.output.say("Error:    " + text);
	}

	/**
	 * Find all users in mumble which contain the supplied string in their name.
	 * For example: ```bot.findUsers("merlin");``` will find "Merlin | LÖML | Mörrrlin".
	 * This method is used in *certain* methods.
	 * @param {string} namePart - Text to search for.
	 */
	findUsers(namePart) {
		namePart = namePart.toLowerCase();
		var users = this.mumble.users();
		var found = [];
		for(var key in users) {
			var user = users[key];
			if(user.name.toLowerCase().indexOf(namePart) !== -1) {
				found.push(user);
			}
		}
		return found;
	}
}

//TODO Util.inherits(Bot, EventEmitter);

module.exports = Bot;
