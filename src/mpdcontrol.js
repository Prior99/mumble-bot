/*
 * Imports
 */
var MPD = require('mpd');

/*
 * Code
 */

var MPDControl = function(bot) {
	this.bot = bot;
	this.mpd = MPD.connect({
		port : bot.options.mpd.port,
		host : bot.options.mpd.host
	});
	this.ready = false;
	this.playing = true;
	this.mpd.on('ready', function() {
		this.ready = true;
		this.mpd.sendCommand("play");
	}.bind(this));
};

MPDControl.prototype.play = function() {
	if(!this.ready) {
		this.bot.sayError("Musicplayback is not ready.");
		return;
	}
	if(this.playing) {
		this.bot.sayError("User is an idiot. Music is already playing.");
		return;
	}
	this.bot.say("Wanna hear some motherfucking music mates?");
	this.bot.voiceOutput.once("speak-stop", function() {
		this.mpd.sendCommand("play");
	}.bind(this));
	this.playing = true;
};

MPDControl.prototype.pause = function() {
	if(!this.ready) {
		this.bot.sayError("Musicplayback is not ready.");
		return;
	}
	if(!this.playing) {
		this.bot.sayError("User is an idiot. Music is already stopped.");
		return;
	}
	this.mpd.sendCommand("pause");
	this.bot.say("Music paused.");
	this.playing = false;
};

module.exports = MPDControl;
