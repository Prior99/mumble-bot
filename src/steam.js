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
var SteamBot = function(bot, options, callback) {
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
		this.options.authCode = code;
		this._startUp();
	}.bind(this));
};

SteamBot.prototype._postLogin = function() {
	this.client.on('message', function(source, message, type, chatter) {
		if(type === Steam.EChatEntryType.ChatMsg) {
			this.bot.command.process(message);
		}
	}.bind(this));
	this.client.on('relationships', function() {
		this._hasFriends = true;
	}.bind(this));
};

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

SteamBot.prototype.stop = function() {
	this.client.setPersonaState(Steam.EPersonaState.Offline);
	this.client.logOff();
};

module.exports = SteamBot;
