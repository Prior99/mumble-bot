/*
 * Imports
 */
var Util = require("util");
var Input = require("./input");
var Command = require("./command");
var Output = require("./output");
var Music = require("./music");
var MPDControl = require("./mpdcontrol");
var Winston = require('winston');
var Website = require('./website');
var Readline = require("readline");
var Quotes = require("./quotes");
var FS = require('fs');
var Steam = require('./steam');
var Minecraft = require('./minecraft');
var EventEmitter = require("events").EventEmitter;
var Permissions = require("./permissions");

var AUDIO_CACHE_AMOUNT = 100;

/*
 * Code
 */

/**
 * This is the constructor of the bot.
 * @constructor
 * @param mumble - already set up mumble connection
 * @param options - Options read from the config.json
 * @param {Database} database - Started connection to database.
 */
var Bot = function(mumble, options, database) {
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

	if(options.minecraft) {
		this.minecraft = new Minecraft(options.minecraft, this);
	}

	this._loadAddons("addons/", function() {
		//Must be run after all commands were registered
		this.input = new Input(this);
		this.input.on('input', function(text, user) {
			this._onVoiceInput(text, user);
		}.bind(this));
	}.bind(this));

	this.mumble.on('user-connect', this.handleUserConnect.bind(this));
	this.newCommand("help", function() {
		var help = "Hilfe. Du musst mich mit meinem hot Word ansprechen. Mein hot Word ist: '" + this.hotword +
			"'. Um eine Liste aller Kommandos zu erhalten, sag: '" + this.hotword +
			" commands'";
		this.say(help);
	}.bind(this), "Gibt einen Hilfetext aus.", "info");
	this.newCommand("commands", function() {
		var commandsSay = "Ich kenne die folgenden Kommandos ";
		var commandsWrite = "Ich kenne die folgenden Kommandos:<br>";
		for(var key in this.command.commands) {
			commandsSay += key + ",";
			commandsWrite += "  * " + key + "<br>";
		}
		this.say(commandsSay + ". Ich habe diese Liste auch in den Chat geschrieben.");
		this.mumble.user.channel.sendMessage(commandsWrite.substring(0, commandsWrite.length - 4));
	}.bind(this), "Gibt eine Liste aller Kommandos aus.", "list-ul");
	this.newCommand("be quiet", this.beQuiet.bind(this), "Sofort alles, was Geräusche verursacht abschalten.", "bell-slash", null, 'be-quiet');
	this.newCommand("shutdown", this.shutdown.bind(this), "Fährt den bot herunter.", "power-off", null, 'shutdown');
};

Util.inherits(Bot, EventEmitter);

Bot.prototype.handleUserConnect = function(user) {
	this.database.getLinkedUser(user.id, function(err, dbUser) {
		if(err) {
			Winston.error("Unable to fetch mumble user linkage.", err);
		}
		else {
			if(dbUser) {
				this.sayImportant(dbUser.username + " hat als " + user.name + " Mumble betreten.");
			}
			else {
				this.sayImportant("Unbekannter Nutzer \"" + user.name + "\" hat Mumble betreten.");
				user.moveToChannel(this.options.kickChannel);
				user.sendMessage("Herzlich Willkommen. Ich bin " + this.options.name + ". Es sollte ein Administrator kommen und dich begrüßen. In der Zwischenzeit kannst du dir unter " + this.options.webpageurl + " einen Account anlegen.");
				this.notifyOnlineUsersWithPermission('grant', "Ein unbekannter Nutzer mit Namen \"" + user.name + "\" hat soeben Mumble betreten.");
			}
		}
	}.bind(this));
};

Bot.prototype.notifyOnlineUsersWithPermission = function(permission, message) {
	this.database.listUsers(function(err, users) {
		if(err) {
			Winston.error("Unable to list users.", err);
		}
		else {
			users.forEach(function(potential) {
				this.permissions.hasPermission(potential, permission, function(has) {
					if(has) {
						this.database.getLinkedMumbleUsersOfUser(potential.username, function(err, ids) {
							if(err) {
								Winston.error("Unable to get linked mumble users of user " + potential.username, err);
							}
							else {
								ids.forEach(function(id) {
									var mumbleUser;
									if(mumbleUser = this.mumble.userById(id.mumbleId)) {
										mumbleUser.sendMessage(message);
									}
								}.bind(this));
							}
						}.bind(this));
					}
				}.bind(this));
			}.bind(this));
		}
	}.bind(this));
};

Bot.prototype._onVoiceInput = function(text, mumbleUser) {
	this.database.getLinkedUser(mumbleUser.id, function(err, user) {
		if(err) {
			Winston.error("Error fetching user by mumble user id.", err);
		}
		else {
			this.command.processPrefixed(text, 'mumble', user);
		}
	}.bind(this));
};

/**
 * Instant shutdown everything which could cause noises.
 */
Bot.prototype.beQuiet = function() {
	this.output.clear();
};

/**
 * Gently shutdown the whole bot.
 */
Bot.prototype.shutdown = function() {
	this.say("Herunterfahren initiiert.", function() {
		this._deleteAllCachedAudio(0);
		this.website.shutdown(function() {
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
		}.bind(this));
	}.bind(this));
};

Bot.prototype._initPromptInput = function() {
	this._rlStdin = Readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	this._rlStdin.on('SIGINT', function() {
		this.emit('SIGINT');
	}.bind(this));
	this._rlStdin.on('line', function(line) {
		this.command.process(line, 'terminal', null);
	}.bind(this));
};

Bot.prototype._initChatInput = function() {
	this.mumble.on("message", function(message, mumbleUser, scope) {
		this.database.getLinkedUser(mumbleUser.id, function(err, user) {
			if(err) {
				Winston.error("Error fetching user by mumble user id.", err);
			}
			else {
				this.command.process(message, 'mumble', user);
			}
		}.bind(this));
    }.bind(this));
};

Bot.prototype._loadAddons = function(dir, callback) {
	FS.readdir(dir, function(err, files) {
		if(err) {
			Winston.error("Error loading addons!");
			throw err;
		}
		else {
			var next = function() {
				if(files.length > 0) {
					var file = files.shift()
					var filename = dir + file;
					if(FS.lstatSync(filename).isDirectory() && file.substr(0, 1) != ".") {
					Winston.info("Loading addon " + filename + " ...");
						var isAsync = require("../" + filename)(this, next);
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
			}.bind(this);
			next();
		}
	}.bind(this));
};

/**
 * Will return whether the bot is busy speaking or listening to anyone.
 * @return If the bot is busy speaking or listening
 */
Bot.prototype.busy = function() {
	return this.output.busy || this.input.busy;
};

/**
 * Plays a sound in the mumble server.
 * @param {string} filename - Filename of the soundfile to play. Must be a mono-channel 48,000Hz WAV-File
 * @param cb - Callback will be called when sound has finished playing
 */
Bot.prototype.playSound = function(filename, cb) {
	this.output.playSound(filename, cb);
};

/**
 * Will start echoing everything a user says.
 * This method is used so that anyone can hear which voice-command
 * is currently given to the bot and not just the bleeep and bloop sounds.
 * @param user - mumble user to start piping.
 */
Bot.prototype.startPipingUser = function(user) {
	//console.log("Piping started");
	if(this.music) {
		this.music.mute();
	}
	this._pipeUserEvent = function(chunk) {
		this._inputStream.write(chunk);
	}.bind(this);
	this._pipeUserStream = user.outputStream(true);
	this._pipeUserStream.on('data', this._pipeUserEvent);
};

/**
 * Stop echoing the user which is currently being echoed.
 */
Bot.prototype.stopPipingUser = function() {
	//console.log("Piping stopped");
	if(this.music) {
		this.music.unmute();
	}
	this._pipeUserStream.removeListener('data', this._pipeUserEvent);
	this._pipeUserStream = undefined;
	this._pipeUserEvent = undefined;
};


/**
 * This is one of the most important methods in the bot.
 * This will define a new command in the bot. Pleas note that all commands have
 * to be defined before the bot has finished starting up (e.g. as addon or
 * defined in the constructor), as the grammar for the speech recognition has to
 * be generated and will not work otherwise.
 * @param {string} commandName - Name of the command to create
 * @param method - Method which will be called when the command was called
 * @param {string} description - Description of the command as displayed on the website
 * @param {string} icon - [Name of a Fontawesome-icon to display.](http://fortawesome.github.io/Font-Awesome/icons/)
 * @param {string[]} arguments - (Optional) Array of possible arguments.
 * @param {string} permission - (Optional) permission needed to execute this command.
 */
Bot.prototype.newCommand = function(commandName, method, description, icon, arguments, permission) {
	if(!arguments) {
		arguments = [];
	}
	this.command.newCommand(commandName, method, arguments, permission);
	this.commands.push({
		name : commandName,
		description : description,
		icon : icon,
		arguments : arguments,
		permission : permission,
		hasArguments : arguments.length > 0
	});
};

/**
 * Makes the bot join a specific channel in mumble.
 * @param cname - Name of the channel to join.
 */
Bot.prototype.join = function(cname) {
	var channel = this.mumble.channelByName(cname);
	channel.join();
};

Bot.prototype.addCachedAudio = function(filename, user, duration) {
	this.cachedAudios.push({
		file : filename,
		date : new Date(),
		user : user,
		id : this._audioId++,
		duration : duration
	});
	this._clearUpCachedAudio();
};

Bot.prototype.getCachedAudioById = function(id) {
	for(var key in this.cachedAudios) {
		var audio = this.cachedAudios[key];
		if(audio.id == id) {
			return audio;
		}
	}
	return null;
};

Bot.prototype.removeCachedAudio = function(audio) {
	var index = this.cachedAudios.indexOf(audio);
	if(index !== -1) {
		this.cachedAudios.splice(index, 1);
		return true;
	}
	else {
		return false;
	}
};

Bot.prototype._clearUpCachedAudio = function() {
	this._deleteAllCachedAudio(this.audioCacheAmount);
};

Bot.prototype._deleteAllCachedAudio = function(amount) {
	while(this.cachedAudios.length > amount) {
		var elem = this.cachedAudios.shift();
		try {
			FS.unlinkSync(elem.file);
			Winston.info("Deleted cached audio file " + elem.file + ".");
		}
		catch(err) {
			Winston.error("Error when cleaning up cached audios!", err);
		}
	}
};

/**
 * Will say something. The text will be played in mumble using TTS, written to
 * the bots current channel (theoretically) and written in minecraft.
 * @param {string} text - Text to say.
 * @param cb - Callback, will be called *after playback of TTS has finished*.
 */
Bot.prototype.say = function(text, cb) {
	if(this.minecraft) {
		this.minecraft.say(text);
	}
	return this.output.say(text, cb);
};

/**
 * Say something important. Other than the normal say method this will also say
 * the shit in steam.
 * @param {string} text - Text to say.
 * @param cb - Callback, will be called *after playback of TTS has finished*.
 */
Bot.prototype.sayImportant = function(text, cb) {
	if(this.steam) {
		this.steam.broadcast(text);
	}
	return this.say(text, cb);
};

/**
 * Report an error by saying it.
 * @param {string} text - Message of the error to report.
 */
Bot.prototype.sayError = function(text) {
	return this.output.say("Fehler:    " + text);
};

/**
 * Find all users in mumble which contain the supplied string in their name.
 * For example: ```bot.findUsers("merlin");``` will find "Merlin | LÖML | Mörrrlin".
 * This method is used in *certain* methods.
 * @param {string} namePart - Text to search for.
 */
Bot.prototype.findUsers = function(namePart) {
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

module.exports = Bot;
