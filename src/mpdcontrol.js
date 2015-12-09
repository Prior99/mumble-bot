/*
 * Imports
 */
import * as MPD from "node-mpd";
import Winston from "winston";

/*
 * Code
 */

/**
 * Control the music player daemon from which the music is streamed into this bot.
 */
class MPDControl {
	/**
	 * @constructor
	 * @param {Bot} bot The instance this is attached to.
	 */
	constructor(bot) {
		this.bot = bot;
		this.playing = false;

		this._minVolume = 25;
		this._stepVolume = 10;
		this._normalVolume = 50;
		this._maxVolume = 100;

		this.mpd = new MPD({
			port : bot.options.mpd.port,
			host : bot.options.mpd.host
		});
		this.mpd.connect();
		this.ready = false;
		this.mpd.on("ready", () => {
			this.ready = true;
		});
		this.mpd.on("update", () => {
			if(this.mpd.status.state !== "play" && this.playing) {
				this.addRandomTrack(() => {
					this.play();
				});
			}
		});
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
	}

	/**
	 * Start playback of music or resume. If the current playlist is empty, it will
	 * be filled with random tracks.
	 * @param {VoidCallback} cb - Callback which will be called after playback has started.
	 * @returns {undefined}
	 */
	play(cb) {
		this.playing = true;
		if(!this.ready) {
			this.bot.sayError("Musikwiedergabemodul nicht bereit.");
			return;
		}
		this.bot.say("Play.");
		if(this.mpd.status.playlistlength === 0) {
			this.addRandomTrack(() => {
				this.mpd.play(cb);
			});
		}
		else {
			this.mpd.play(cb);
		}
	}

	/**
	 * Pause the current playback.
	 * @param {DatabaseUser} user - The user that invoked the pause.
	 * @param {string} via - The way the user invoked the command (steam, minecraft, chat, console, webinterface, ...).
	 * @param {VoidCallback} cb - Callback which will be called after playback has paused.
	 * @returns {undefined}
	 */
	pause(user, via, cb) {
		this.playing = false;
		if(!this.ready) {
			this.bot.sayError("Musikwiedergabemodul nicht bereit.");
		}
		else {
			this.mpd.pause(cb);
			this.bot.say("Pause.");
		}
	}

	/**
	 * Skip the currently playing song and playback the next one. If no more tracks
	 * are in the playlist, a random one will be added.
	 * @param {DatabaseUser} user - The user that invoked the command.
	 * @param {string} via - The way the user invoked the command (steam, minecraft, chat, console, webinterface, ...).
	 * @param {VoidCallback} cb - Callback which will be called after the next song has started playing.
	 * @returns {undefined}
	 */
	next(user, via, cb) {
		if(!this.ready) {
			this.bot.sayError("Musikwiedergabemodul nicht bereit.");
			return;
		}
		this.bot.say("Nächster Song.", () => {
			if(this.mpd.status.playlistlength <= 1) {
				this.addRandomTrack(() => {
					this.mpd.next(cb);
					this.mpd.play();
				});
			}
			else {
				this.mpd.next(cb);
			}
		});
	}

	/**
	 * Set the volume to a normal level of 50%.
	 * @returns {undefined}
	 */
	volumeNormal() {
		this.setVolume(this._normalVolume);
	}

	/**
	 * Set the volume to a minimum level of 25%.
	 * @returns {undefined}
	 */
	volumeMin() {
		this.setVolume(this._minVolume);
	}

	/**
	 * Set the volume to the maximum level of 100%.
	 * @returns {undefined}
	 */
	volumeMax() {
		this.setVolume(this._maxVolume);
	}

	/**
	 * Increase the volume by 10%.
	 * @returns {undefined}
	 */
	volumeUp() {
		this.setVolume(this.mpd.status.volume*this._maxVolume + this._stepVolume);
	}

	/**
	 * Decrease the volume by 10%.
	 * @returns {undefined}
	 */
	volumeDown() {
		this.setVolume(this.mpd.status.volume*this._maxVolume - this._stepVolume);
	}

	/**
	 * Set the volume to a specified value.
	 * @param {int} vol - Volume to set.
	 * @returns {undefined}
	 */
	setVolume(vol) {
		this.bot.say(vol + "%", () => {
			this.mpd.volume(vol, err => {
				if(err) {
					Winston.error(err);
				}
			});
		});
	}

	/**
	 * Adds a random track to the playlist.
	 * @param {DatabaseUser} user - The user that invoked the command.
	 * @param {string} via - The way the user invoked the command (steam, minecraft, chat, console, webinterface, ...).
	 * @param {VoidCallback} cb Callback which will be called after the track was added.
	 * @returns {undefined}
	 */
	addRandomTrack(user, via, cb) {
		this.bot.say("Zufälliger Song.", () => {
			const song = this.mpd.songs[parseInt(this.mpd.songs.length * Math.random())];
			this.mpd.add(song.file, cb);
		});
	}

	/**
	 * Shutdown the client to mpd.
	 * @returns {undefined}
	 */
	stop() {
		Winston.info("Disconnecting from mpd ... ");
		this.mpd.disconnect();
	}
}

module.exports = MPDControl;
