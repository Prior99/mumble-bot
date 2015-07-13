/*
 * Imports
 */
var MPD = require('node-mpd');
var Winston = require('winston');

/*
 * Code
 */

/**
 * Control the music player daemon from which the music is streamed into this bot.
 * @constructor
 * @param {Bot} bot - The instance this is attached to.
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

/**
 * Start playback of music or resume. If the current playlist is empty, it will
 * be filled with random tracks.
 * @param cb - Callback which will be called after playback has started.
 */
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

/**
 * Pause the current playback.
 * @param cb - Callback which will be called after playback has paused.
 */
MPDControl.prototype.pause = function(user, via, cb) {
	this.playing = false;
	if(!this.ready) {
		this.bot.sayError("Musikwiedergabemodul nicht bereit.");
		return;
	}
	this.mpd.pause(cb);
	this.bot.say("Pause.");
};
/**
 * Skip the currently playing song and playback the next one. If no more tracks
 * are in the playlist, a random one will be added.
 * @param cb - Callback which will be called after the next song has started
 * 			   playing.
 */
MPDControl.prototype.next = function(user, via, cb) {
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
/**
 * Set the volume to a normal level of 50%.
 */
MPDControl.prototype.volumeNormal = function() {
	this.setVolume(50);
};

/**
 * Set the volume to a minimum level of 25%.
 */
MPDControl.prototype.volumeMin = function() {
	this.setVolume(25);
};

/**
 * Set the volume to the maximum level of 100%.
 */
MPDControl.prototype.volumeMax = function() {
	this.setVolume(100);
};

/**
 * Increase the volume by 10%.
 */
MPDControl.prototype.volumeUp = function() {
	this.setVolume(this.mpd.status.volume*100 + 10);
};

/**
 * Decrease the volume by 10%.
 */
MPDControl.prototype.volumeDown = function() {
	this.setVolume(this.mpd.status.volume*100 - 10);
};

/**
 * Set the volume to a specified value.
 * @param vol - Volume to set.
 */
MPDControl.prototype.setVolume = function(vol) {
	this.bot.say("Lautstärke " + vol + "%", function() {
		this.mpd.volume(vol, function(err) {
			if(err) {
				Winston.error(err);
			}
		});
	}.bind(this));
};

/**
 * Adds a random track to the playlist.
 * @param cb - Callback which will be called after the track was added.
 */
MPDControl.prototype.addRandomTrack = function(user, via, cb) {
	this.bot.say("Zufälliger Song.", function() {
		var song = this.mpd.songs[parseInt(this.mpd.songs.length * Math.random())];
		this.mpd.add(song.file, cb);
	}.bind(this));
};

/**
 * Shutdown the client to mpd.
 */
MPDControl.prototype.stop = function() {
	Winston.info("Disconnecting from mpd ... ");
	this.mpd.disconnect();
};

module.exports = MPDControl;
