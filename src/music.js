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
	this.volume = 0.5;
	this.fifo.on('data', function(chunk) {
		if(!this.muted) {
			//scaleVolume(chunk, this.volume);
			this.inputStream.write(chunk);
		}
	}.bind(this));
};

function scaleVolume(buffer, volume) {
	for(var i = 0; i < buffer.length; i++) {
		buffer[i] *= volume;
	}
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
