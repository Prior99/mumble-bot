/*
 * Imports
 */

var User = require('./user');
var Winston = require('winston');
var Util = require("util");
var EventEmitter = require("events").EventEmitter;

/*
 * Code
 */

/**
 * This class handles voice input for all users. It uses instances of user.js
 * and handles them.
 * @constructor
 * @param {Bot} bot - Instance of the bot this belongs to.
 */
var VoiceInput = function(bot) {
	this.bot = bot;
	this.users = {};
	this._initConnectedUsers(bot.mumble.users());
	bot.mumble.on('user-connect', this._addUser.bind(this));
	bot.mumble.on('user-disconnect', this._removeUser.bind(this));
	Winston.info("Module started: Voice input");
};

Util.inherits(VoiceInput, EventEmitter);

VoiceInput.prototype._initConnectedUsers = function(users) {
	for(var i in users) {
		this._addUser(users[i]);
	}
};

VoiceInput.prototype._addRegisteredUser = function(user, databaseUser) {
	Winston.info("Input registered for user " + user.name);
	var localUser = new User(user, databaseUser, this.bot);
	this.users[user.id] = localUser;
	var stream = user.outputStream(true);
	stream.pipe(localUser);
};

VoiceInput.prototype._addUser = function(user) {
	this.bot.database.getLinkedUser(user.id, function(err, databaseUser) {
		if(err) {
			Winston.error("Error occured when trying to fetch user by mumble id", err);
		}
		if(databaseUser) {
			this._addRegisteredUser(user, databaseUser);
		}
		else {
			Winston.info("Did not register input for user " + user.name + " as this user is not linked to any database user.");
		}
	}.bind(this));
};

VoiceInput.prototype._removeUser = function(user) {
	Winston.info("Input stopped for user " + user.name);
	delete this.users[user.id];
};



module.exports = VoiceInput;
