/*
 * Imports
 */
import * as FS from "fs";
import Winston from "winston";

/*
 * Code
 */

/**
 * Handles playback of music from a fifo fed by a music player daemon.
 * This only echos the music streamed from the fifo into the mumble server and
 * does not control the playback, which is handled by mpdcontrol.js

 * @param {Bot} bot - Bot this instance is attached to.
 */
class Music {
	/**
	 * @param {Bot} bot The main Bot instance.
	 * @constructor
	 */
	constructor(bot) {
		this.path = bot.options.mpd.fifo;
		this.fifo = FS.createReadStream(this.path, {
			flags : "r+"
		});
		this.inputStream = bot.mumble.inputStream();
		this.muted = false;
		this.volume = 0.5;
		this.fifo.on("data", this._onData.bind(this));
		Winston.info("Module started: Music");
	}

	/**
	 * Data listener
	 * @param {buffer} chunk - The incomming data.
	 * @returns {undefined}
	 */
	_onData(chunk) {
		if(!this.muted) {
			this.inputStream.write(chunk);
		}
	}

	/**
	 * Not working. This method should scale a pcm signal to lower or increase the
	 * volume.
	 * @param {array} buffer - Buffer containing the pcm data to be scaled
	 * @param {number} volume - Factor to scale the pcm data by.
	 * @return {undefined}
	 */
	scaleVolume(buffer, volume) {
		for(let i = 0; i < buffer.length; i++) {
			buffer[i] *= volume;
		}
	}

	/**
	 * Toggles muting of playback. If the playback is muted, it will be unmuted and vice-versa.
	 * @returns {undefined}
	 */
	toggleMute() {
		this.muted = !this.muted;
	}

	/**
	 * Mutes the playback.
	 * @returns {undefined}
	 */
	mute() {
		this.muted = true;
	}

	/**
	 * Unmutes the playback.
	 * @returns {undefined}
	 */
	unmute() {
		this.muted = false;
	}

	/**
	 * Shuts down this module.
	 * @returns {undefined}
	 */
	stop() {
		Winston.info("Shutting down music ... ");
		this.fifo.once("close", () => {
			Winston.info("Music stopped.");
		});
		this.fifo.removeListener("data", this._onData);
		const c = FS.createWriteStream(this.path);
		c.write("\0");
		c.close();
		this.fifo.pause();
		this.fifo.close();
	}
}

module.exports = Music;
