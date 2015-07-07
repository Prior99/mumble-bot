
/*
 * Includes
 */
var Mineflayer = require('mineflayer');
var Winston = require('winston');
var EventEmitter = require("events").EventEmitter;
var Util = require("util");

/*
 * Code
 */

/**
 * This  class handles the connection of the bot to minecraft.
 * @constructor
 * @param options - Options for the connection read from config file
 * @param bot - The bot this minecraft class is attached to
 */
var Minecraft = function(options, bot) {
	this.bot = bot;
	Winston.info("Connecting to Minecraft server on " + options.host + ":" + options.port + " as " + bot.options.name + " ...");
	this.mc = Mineflayer.createBot({
		host : options.host,
		port : options.port,
		username : bot.options.name,
		keepAlive : true
	});
	this._ready = false;
	this.mc.once('spawn', function() {
		Winston.info("Connected to minecraft and spawned at " + this.mc.entity.position);
		this._ready = true;
	}.bind(this));
	this.mc.on('chat', this._onChat.bind(this));
};

Util.inherits(Minecraft, EventEmitter);

Minecraft.prototype._onChat = function(username, message) {
	if(username !== this.mc.username) {
		this.bot.command.processPrefixed(message);
	}
};

/**
 * Say something in the minecraft servers chat.
 * @param {string} msg - The message to say in the servers chat
 */
Minecraft.prototype.say = function(msg) {
	if(this._ready) {
		this.mc.chat(msg);
	}
};

/**
 * Disconnect from minecraft gently and shutdown this instance.
 */
Minecraft.prototype.stop = function() {
	Winston.info("Closing connection to Minecraft ...");
	this.mc.on('end', function() {
		Winston.info("Disconnected from Minecraft.");
	});
	this.mc.quit();
};

module.exports = Minecraft;
