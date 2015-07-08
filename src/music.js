/*
 * Imports
 */
var FS = require('fs');
var Winston = require('winston');
/*
 * Code
 */

/**
 * Handles playback of music from a fifo fed by a music player daemon.
 * This only echos the music streamed from the fifo into the mumble server and
 * does not control the playback, which is handled by mpdcontrol.js
 * @constructor
 * @param {Bot} bot - Bot this instance is attached to.
 */

var Music = function(bot) {
	this.path = bot.options.mpd.fifo;
	this.fifo = FS.createReadStream(this.path, {
		flags : 'r+'
	});
	this.inputStream = bot.mumble.inputStream();
	this.muted = false;
	this.volume = 0.5;
	this.fifo.on('data', this._onData.bind(this));
	Winston.info("Module started: Music");
};

Music.prototype._onData = function(chunk) {
	if(!this.muted) {
		this.inputStream.write(chunk);
	}
};

/**
 * Not working. This method should scale a pcm signal to lower or increase the
 * volume.
 * @param buffer - Buffer containing the pcm data to be scaled
 * @param {number} volume - Factor to scale the pcm data by.
 */
function scaleVolume(buffer, volume) {
	for(var i = 0; i < buffer.length; i++) {
		buffer[i] *= volume;
	}
};

/**
 * Toggles muting of playback. If the playback is muted, it will be unmuted and
 * vice-verse.
 */
Music.prototype.toggleMute = function() {
	this.muted = !this.muted;
};

/**
 * Mutes the playback.
 */
Music.prototype.mute = function() {
	this.muted = true;
};

/**
 * Unmutes the playback.
 */
Music.prototype.unmute = function() {
	this.muted = false;
};

/**
 * Shuts down this module.
 */
Music.prototype.stop = function() {
	Winston.info("Shutting down music ... ");
	this.fifo.once('close', function() {
		Winston.info("Music stopped.");
	});
	this.fifo.removeListener('data', this._onData);
	var c = FS.createWriteStream(this.path);
	c.write('\0');
	c.close();
	this.fifo.pause();
	this.fifo.close();
};

module.exports = Music;
