/*
 * Imports
 */
var FS = require('fs');
/*
 * Code
 */
var Music = function(bot) {
	this.fifo = FS.createReadStream(bot.options.mpd.fifo);
	this.inputStream = bot.mumble.inputStream();
	this.muted = false;
	this.fifo.on('data', function(chunk) {
		if(!this.muted) {
			this.inputStream.write(chunk);
		}
	}.bind(this));
};

Music.prototype.toggleMute = function() {
	this.muted = !this.muted;
};

Music.prototype.mute = function() {
	this.muted = true;
};

Music.prototype.unmute = function() {
	this.muted = false;
};

module.exports = Music;
