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
		bot.newCommand("music pause", this.pause.bind(this));
		/*bot.newCommand("music volume up", this.volumeUp.bind(this));
		bot.newCommand("music volume down", this.volumeDown.bind(this));
		bot.newCommand("music volume max", this.volumeMax.bind(this));
		bot.newCommand("music volume min", this.volumeMin.bind(this));
		bot.newCommand("music volume normal", this.volumeNormal.bind(this));*/
		bot.newCommand("music resume", this.play.bind(this));
	}
	Winston.info("Module started: MPD control");
};

MPDControl.prototype.play = function() {
	if(!this.ready) {
		this.bot.sayError("Musikwiedergabemodul nicht bereit.");
		return;
	}
	this.bot.say("Musikwiedergabe fortgesetzt.");
	this.bot.voiceOutput.once("speak-stop", function() {
	this.mpd.play();
		if(this.mpd.status.playlistlength == 0) {
			this.addRandomTrack(function() {
				this.mpd.play();
			}.bind(this));
		}
	}.bind(this));
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

MPDControl.prototype.addRandomTrack = function(cb) {
	this.bot.say("Ein zufälliger Song wird der Wiedergabeliste hinzugefügt.", function() {
		this.mpd.listall(function(songs) {
			var song = songs[parseInt(songs.length * Math.random())];
			this.mpd.add(song, cb);
		}.bind(this));
	}.bind(this));
};

module.exports = MPDControl;
