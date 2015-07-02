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
	this.playing = false;
	this.mpd = new MPD({
		port : bot.options.mpd.port,
		host : bot.options.mpd.host
	});
	this.mpd.connect();
	this.ready = false;
	this.mpd.on('ready', function() {
		this.ready = true;
	}.bind(this));
	this.mpd.on('update', function() {
		if(this.mpd.status.state !== "play" && this.playing) {
			this.addRandomTrack(function() {
				this.play();
			}.bind(this));
		}
	}.bind(this));
	if(bot.options.mpd) {
		bot.newCommand("pause", this.pause.bind(this), "Pausiert die Musikwiedergabe.", "pause");
		bot.newCommand("next", this.next.bind(this), "Nächster Song.", "fast-forward");
		bot.newCommand("volume up", this.volumeUp.bind(this), "Lautstärke erhöhen.", "volume-up");
		bot.newCommand("volume down", this.volumeDown.bind(this), "Lautstärke senken.", "volume-down");
		bot.newCommand("volume max", this.volumeMax.bind(this), "Lautstärke auf 100% setzen.", "volume-up");
		bot.newCommand("volume min", this.volumeMin.bind(this), "Lautstärke auf 25% setzen.", "volume-off");
		bot.newCommand("volume normal", this.volumeNormal.bind(this), "Lautstärke auf 50% setzen.", "volume-down");
		bot.newCommand("play", this.play.bind(this), "Setzt die Musikwiedergabe fort.", "play");
	}
	Winston.info("Module started: MPD control");
};

MPDControl.prototype.play = function(cb) {
	this.playing = true;
	if(!this.ready) {
		this.bot.sayError("Musikwiedergabemodul nicht bereit.");
		return;
	}
	this.bot.say("Play.");
	if(this.mpd.status.playlistlength == 0) {
		this.addRandomTrack(function() {
			this.mpd.play(cb);
		}.bind(this));
	}
	else {
		this.mpd.play(cb);
	}
};

MPDControl.prototype.pause = function(cb) {
	this.playing = false;
	if(!this.ready) {
		this.bot.sayError("Musikwiedergabemodul nicht bereit.");
		return;
	}
	this.mpd.pause(cb);
	this.bot.say("Pause.");
};

MPDControl.prototype.next = function(cb) {
	if(!this.ready) {
		this.bot.sayError("Musikwiedergabemodul nicht bereit.");
		return;
	}
	this.bot.say("Nächster Song.");
	if(this.mpd.status.playlistlength <= 1) {
		this.addRandomTrack(function() {
			this.mpd.next(cb);
			this.mpd.play();
		}.bind(this));
	}
	else {
		this.mpd.next(cb);
	}
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
	this.bot.say("Zufälliger Song.", function() {
		var song = this.mpd.songs[parseInt(this.mpd.songs.length * Math.random())];
		this.mpd.add(song.file, cb);
	}.bind(this));
};

module.exports = MPDControl;
