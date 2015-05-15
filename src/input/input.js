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

var VoiceInput = function(bot) {
	this.bot = bot;
	this.users = {};
	this.initConnectedUsers(bot.mumble.users());
	bot.mumble.on('user-connect', this._addUser.bind(this));
	bot.mumble.on('user-disconnect', this._removeUser.bind(this));
	Winston.info("Module started: Voice input");
	this.busy = false;
	this.activeUser = null;
	this.stats = {
		total : 0,
		succeeded : 0
	}
};

Util.inherits(VoiceInput, EventEmitter);

VoiceInput.prototype._setActiveUser = function(user) {
	this.busy = true;
	this.activeUser = user;
};

VoiceInput.prototype._setInactive = function() {
	this.busy = false;
	this.activeUser = null;
};

VoiceInput.prototype.initConnectedUsers = function(users) {
	for(var i in users) {
		this._addUser(users[i]);
	}
};

VoiceInput.prototype._dispatch = function(command, user) {
	Winston.info("Dispatching command \"" + command + "\" for user " + user.name);
	this.emit('input', command, user);
};

VoiceInput.prototype._addUser = function(user) {
	Winston.info("Input registered for user " + user.name);
	var localUser = new User(user, this.bot.hotword);
	this.users[user.id] = localUser;
	user.outputStream(true).on('data', function(chunk) {
		if(!this.bot.busy()) {
			this._setActiveUser(user);
		}
		if(this.busy && this.activeUser == user) {
			localUser.data(chunk);
		}
	}.bind(this));
	localUser.on('failure', function() {
		if(this.busy && this.activeUser == user) {
			this.stats.total ++;
			this.bot.playSound("sounds/recognition_failure.wav", this._setInactive.bind(this));
			Winston.info("Recognition failed for user " + user.name + parseInt((this.stats.succeeded / this.stats.total) * 100) + "% of all " + this.stats.total + " querys succeed.");
		}
	}.bind(this));
	localUser.on('success', function(command) {
		if(this.busy && this.activeUser == user) {
			this.stats.total++;
			this.stats.succeeded++;
			this.bot.playSound("sounds/recognition_success.wav", function() {
				Winston.info("Recognition succeeded for user " + user.name);
				this._setInactive();
				this._dispatch(command, user);
			}.bind(this));
		}
	}.bind(this));
	localUser.on('started', function() {
		if(this.busy && this.activeUser == user) {
			Winston.info("Recognition started for user " + user.name);
			this.bot.playSound("sounds/recognition_started.wav");
		}
	}.bind(this));
};

VoiceInput.prototype._removeUser = function(user) {
	Winston.info("Input stopped for user " + user.name);
	this._users[user.id].disconnect();
	delete this._users[user.id];
};



module.exports = VoiceInput;
