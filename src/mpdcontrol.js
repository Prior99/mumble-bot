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
	if(bot.options.mpd) {
		bot.newCommand("music pause", this.pause.bind(this));
		/*bot.newCommand("music volume up", this.volumeUp.bind(this));
		bot.newCommand("music volume down", this.volumeDown.bind(this));
		bot.newCommand("music volume max", this.volumeMax.bind(this));
		bot.newCommand("music volume min", this.volumeMin.bind(this));
		bot.newCommand("music volume normal", this.volumeNormal.bind(this));*/
		bot.newCommand("music resume", this.play.bind(this));
	}
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

MPDControl.prototype.volumeChange = function(vol, relative) {
	if(!this.ready) {
		this.bot.sayError("Musicplayback is not ready.");
		return;
	}
	if(relative) {
		this.bot.music.volume += vol;
	}
	else {
		this.bot.music.volume = vol;
	}
	this.bot.say(this.volume + " percent");
};

MPDControl.prototype.volumeDown = function() {
	this.volumeChange(-.1, true);
};

MPDControl.prototype.volumeUp = function() {
	this.volumeChange(.1, true);
};

MPDControl.prototype.volumeMax = function() {
	this.volumeChange(1, false);
};

MPDControl.prototype.volumeMin = function() {
	this.volumeChange(.1, false);
};

MPDControl.prototype.volumeNormal = function() {
	this.volumeChange(.5, false);
};

module.exports = MPDControl;
