/*
 * Imports
 */

import Samplerate from "node-samplerate";
import Util from "util";
import Winston from "winston";
import FS from "fs";
import EventEmitter from "events";
import FFMpeg from "fluent-ffmpeg";

const msInS = 1000;
const audioFreq = 48000;

/**
 * Handles playing back raw PCM audio soundfiles (WAV). Those need to be exactly
 * 44,100Hz and mono-channel. This class is used by Output and is not intended
 * to be used seperatly.
 */
class Sound extends EventEmitter {
	/**
	 * @constructor
	 * @param {WritableStream} stream - Stream to write the audio data to.
 	 */
	constructor(stream) {
		super();
		this.playing = false;
		this.stream = stream;
		this.current = null;
		this.queue = [];
	}

	/**
	 * Plays the file.
	 * @param {string} filename - The filename of the file to be played.
	 * @returns {undefined}
	 */
	_play(filename) {
		let samplesTotal = 0;
		const startTime = Date.now();
		this._playbackStarted();
		this._ffmpeg = FFMpeg(filename)
		.format("s16le")
		.audioChannels(1)
		.audioFrequency(audioFreq);
		this._ffmpeg.stream().on("data", chunk => {
			samplesTotal += chunk.length / 2;
			this.stream.write(chunk);
		})
		.on("end", () => {
			const timeAlreadyTaken = Date.now() - startTime;
			const totalTime = (samplesTotal / audioFreq) * msInS;
			const waitTime = totalTime - timeAlreadyTaken;
			this._timeout = setTimeout(this._playbackStopped.bind(this), waitTime);
		});
	}

	/**
	 * Clear the whole queue and stop current playback.
	 * @returns {undefined}
	 */
	clear() {
		this.queue = [];
		if(this._timeout) {
			clearTimeout(this._timeout);
			this._timeout = null;
		}
		if(this._ffmpeg) {
			this._ffmpeg.kill();
		}
		this._playbackStopped();
	}

	/**
	 * When the playback started.
	 * @returns {undefined}
	 */
	_playbackStarted() {
		this.playing = true;
		this.emit("start");
	}

	/**
	 * When the playback stopped.
	 * @returns {undefined}
	 */
	_playbackStopped() {
		this.playing = false;
		if(this.current) {
			this.emit("stop");
			const callback = this.current.callback;
			this.current = null;
			this._next();
			if(callback) {
				callback();
			}
		}
	}

	/**
	 * Plays the next sound in the queue.
	 * @returns {undefined}
	 */
	_next() {
		if(!this.playing && this.queue.length !== 0) {
			this.current = this.queue.shift();
			this._play(this.current.file);
		}
	}

	/**
	 * Enqueue a new workitem to play back when queue is processed.
	 * @param {TODO} workitem - Workitem to enqueue containing the filename of the
	 *					 soundfile.
	 * @returns {undefined}
	 */
	enqueue(workitem) {
		this.queue.push(workitem);
		if(!this.playing) {
			this._next();
		}
	}

	/**
	 * Stop the sound submodule.
	 * @return {undefined}
	 */
	stop() {
		if(this._timeout) {
			clearTimeout(this._timeout);
		}
	}
}

module.exports = Sound;
