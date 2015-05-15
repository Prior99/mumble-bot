/*
 * Imports
 */
var MPD = require('node-mpd');
var Winston = require('winston');

/*
 * Code
 */

var MPDControl = function(bot) {
	this.bot = bot;
	this.mpd = new MPD({
		port : bot.options.mpd.port,
		host : bot.options.mpd.host
	});
	this.mpd.connect();
	this.ready = false;
	this.mpd.on('ready', function() {
		this.ready = true;
	}.bind(this));
	if(bot.options.mpd) {
		bot.newCommand("pause", this.pause.bind(this));
		bot.newCommand("volume up", this.volumeUp.bind(this));
		bot.newCommand("volume down", this.volumeDown.bind(this));
		bot.newCommand("volume max", this.volumeMax.bind(this));
		bot.newCommand("volume min", this.volumeMin.bind(this));
		bot.newCommand("volume normal", this.volumeNormal.bind(this));
		bot.newCommand("play", this.play.bind(this));
	}
	Winston.info("Module started: MPD control");
};

MPDControl.prototype.play = function() {
	if(!this.ready) {
		this.bot.sayError("Musikwiedergabemodul nicht bereit.");
		return;
	}
	this.bot.say("Musikwiedergabe fortgesetzt.");
	this.mpd.play();
	if(this.mpd.status.playlistlength == 0) {
		this.addRandomTrack(function() {
			this.mpd.play();
		}.bind(this));
	}
	this.playing = true;
};

MPDControl.prototype.pause = function() {
	if(!this.ready) {
		this.bot.sayError("Musikwiedergabemodul nicht bereit.");
		return;
	}
	this.mpd.pause();
	this.bot.say("Musikwiedergabe angehalten.");
	this.playing = false;
};

MPDControl.prototype.volumeNormal = function() {
	this.setVolume(50);
};

MPDControl.prototype.volumeMin = function() {
	this.setVolume(25);
};

MPDControl.prototype.volumeMax = function() {
	this.setVolume(100);
};

MPDControl.prototype.volumeUp = function() {
	this.setVolume(this.mpd.status.volume*100 + 10);
};

MPDControl.prototype.volumeDown = function() {
	this.setVolume(this.mpd.status.volume*100 - 10);
};

MPDControl.prototype.setVolume = function(vol) {
	this.bot.say("Lautstärke " + vol + "%", function() {
		this.mpd.volume(vol, function(err) {
			if(err) {
				Winston.error(err);
			}
		});
	}.bind(this));
};

MPDControl.prototype.addRandomTrack = function(cb) {
	this.bot.say("Zufälliger Song wird hinzugefügt.", function() {
		var song = this.mpd.songs[parseInt(this.mpd.songs.length * Math.random())];
		this.mpd.add(song.file, cb);
	}.bind(this));
};

module.exports = MPDControl;
