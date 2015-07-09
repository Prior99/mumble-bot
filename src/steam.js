/*
 * Includes
 */
var Steam = require("steam");
var Util = require("util");
var EventEmitter = require("events").EventEmitter;
var Winston = require("winston");
var FS = require("fs");
var Readline = require('readline');
/*
 * Code
 */

/**
 * Handles the bots connection to steam.
 * @constructor
 * @param {Bot} bot - Bot this instance was created in.
 * @param options - Options to connect with, read from configfile.
 */
var SteamBot = function(bot, options) {
	this.bot = bot;
	this.options = {
		accountName : options.user,
		password : options.password
	};
	FS.readFile("steam-sentry-hash", function(err, hash) {
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
	}.bind(this));
};

Util.inherits(SteamBot, EventEmitter);

SteamBot.prototype._startUpSteamGuard = function() {
	var rl = Readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: false
	});
	console.log("PLEASE ENTER YOUR STEAMGUARD CODE:");
	rl.on("line", function(code) {
		if(code.length > 0) {
			this.options.authCode = code;
		}
		else {
			Winston.warn("No steam guardcode supplied. You should receive an email now.");
		}
		this._startUp();
	}.bind(this));
};

SteamBot.prototype._onMessage = function(message, steamId) {
	this.bot.database.getUserBySteamId(steamId, function(err, user) {
		if(err) {
			Winston("Error fetching user by steamid", err);
		}
		else {
			this.bot.command.process(message, 'steam', user);
		}
	});
};

SteamBot.prototype._postLogin = function() {
	this.client.on('message', function(source, message, type, chatter) {
		if(type === Steam.EChatEntryType.ChatMsg) {
			this._onMessage(message, chatter);
		}
	}.bind(this));
	this.client.on('relationships', function() {
		this._hasFriends = true;
	}.bind(this));
	this.client.on('friend', function(id, status) {
		if(status == Steam.EFriendRelationship.RequestRecipient) {
			this.client.addFriend(id);
			this.client.once('user', function(friend) {
				this.bot.sayImportant("Ich bin auf Steam jetzt mit " + friend.playerName + " befreundet.");
			}.bind(this));
			this.client.requestFriendData(id);
		}
	}.bind(this));
	this.client.on('user', function(friend) {
		if(!this.client.users || !this.client.users[friend.friendid]) {
			return;
		}
		if(friend.personaState === 1 && this.client.users[friend.friendid].personaState === 0) {
			this.bot.say(friend.playerName + " hat sich in Steam angemeldet.");
		}
		else if(friend.personaState === 0 && this.client.users[friend.friendid].personaState === 1) {
			this.bot.say(friend.playerName + " hat sich in Steam abgemeldet.");
		}
	}.bind(this));
};

/**
 * Sends a message to all friends of this bot.
 * @param {string} message - Message to send to all friends.
 */
SteamBot.prototype.broadcast = function(message) {
	if(this._hasFriends) {
		for(var id in this.client.friends) {
			this.client.sendMessage(id, message, Steam.EChatEntryType.ChatMsg);
		};
	}
};

SteamBot.prototype._startUp = function() {
	Winston.info("Connecting to steam as " + this.options.accountName + " ... ");
	this.client = new Steam.SteamClient();
	this.client.logOn(this.options);
	this.client.on('loggedOn', function() {
		this.client.setPersonaState(Steam.EPersonaState.Online);
		Winston.info("Connected to Steam.");
		this._postLogin();
	}.bind(this));
	this.client.on('sentry', function(hash) {
		Winston.info("Saving steam sentry hash: " + hash + ".");
		FS.writeFileSync("steam-sentry-hash", hash);
	});
};

/**
 * Disconnect from steam gently.
 */
SteamBot.prototype.stop = function() {
	this.client.setPersonaState(Steam.EPersonaState.Offline);
	Winston.info("Disconnecting from steam ...");
	this.client.logOff();
};

module.exports = SteamBot;
