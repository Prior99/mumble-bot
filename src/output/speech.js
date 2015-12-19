import * as ESpeak from "node-espeak";
import * as Samplerate from "node-samplerate";
import EventEmitter from "events";
import * as Winston from "winston";
import GoogleTTS from "./googletranslatetts";
import BingTTS from "./bingtranslatetts";
import ResponsiveTTS from "./responsivetts";
import Sox from "sox-audio";
import {PassThrough as PassThroughStream} from "stream";
import * as FS from "fs";

const msPerSecond = 1000;
const sampleRate = 48000;
const bits = 16;
const timeoutDuration = 100;

/**
 * Handles the speech dispatching queue for the bot.
 * This class is intended to be used by Output and
 * not to be used seperatly.
 */
class Speech extends EventEmitter {
	/**
	 * @constructor
	 * @param {WriteableStream} stream - Stream to write audio data to.
	 * @param {string} espeakData - Path to ESpeak data directory.
	 * @param {Channel} channel - Mumble channel this bot is currently in to send text as chat
	 * 				    message to. This is really not a good idea to happen here
	 * 					should be changed asap.
	 * @param {Database} database - Instance of the database to work with for Google
	 *								Translate TTS cache.
	 * @param {Bot} bot - The bot instance this speechdispatcher belongs to.
	 */
	constructor(stream, espeakData, channel, database, bot) {
		super();
		this.queue = [];
		this.gender = "female";
		ESpeak.initialize({
			lang : "de",
			gender : this.gender
		}, {
			rate : 130,
			gap: 1.5
		}, espeakData);
		ESpeak.onVoice(this._onESpeakData.bind(this));

		this.stream = new PassThroughStream();
		this._sox = new Sox(this.stream)
			.inputSampleRate("48k")
			.inputBits(bits)
			.inputChannels(1)
			.inputFileType("raw")
			.inputEncoding("signed")
		const output = this._sox.output(stream)
			.outputSampleRate("48k")
			.outputEncoding("signed")
			.outputBits(bits)
			.outputChannels(1)
			.outputFileType("raw");
		if(bot.options.audioEffects) {
			bot.options.audioEffects.forEach((effect) => {
				output.addEffect(effect.effect, effect.options);
				Winston.info("Adding sox effect to output: " + effect.effect + ", " + effect.options.join(" "));
			});
		}
		this._sox.run();
		this.engine = "google";
		if(bot.options.responsiveTTS) {
			this._responsiveEngine = ResponsiveTTS(database);
			this._responsiveEngine.on("data", this._onTTSData.bind(this));
			this._responsiveEngine.on("speechDone", () => this._speakingStopped());
			this.engine = "responsive";
		}
		if(bot.options.bingTTS) {
			this._bingEngine = BingTTS(bot.options.bingTTS.clientID, bot.options.bingTTS.clientSecret, database);
			this._bingEngine.on("data", this._onTTSData.bind(this));
			this._bingEngine.setGender("female");
			this._bingEngine.on("speechDone", () => this._speakingStopped());
			this.engine = "bing";
		}
		this._googleEngine = GoogleTTS(database);
		this._googleEngine.on("data", this._onTTSData.bind(this));
		this._googleEngine.on("speechDone", () => this._speakingStopped());
		this.busy = false;
		this.current = null;
		this.timeout = null;
		this.speaking = false;
		this.muted = false;
		this.channel = channel;
	}

	/**
	 * Clear the whole queue and stop current playback.
	 * @return {undefined}
	 */
	clear() {
		this.queue = [];
		ESpeak.cancel();
		if(this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = null;
		}
		this._speakingStopped();
	}

	/**
	 * Refresh the timeout after which the speaking is considered as stopped.
	 * @return {undefined}
		 */
	_refreshTimeout() {
		if(this.timeout) {
			clearTimeout(this.timeout);
		}
		this.timeout = setTimeout(this._speakingStopped.bind(this), this.speakTimeoutDuration);
	}

	/**
	 * Called by the timeout when the speaking has stopped. Processes the queue.
	 * @return {undefined}
	 */
	_speakingStopped() {
		this.speakTimeoutDuration = 0;
		this.speaking = false;
		this.timeout = null;
		this.emit("stop", this.current);
		if(this.current) {
			const callback = this.current.callback;
			this.current = null;
			this._next();
			if(callback) {
				callback();
			}
		}
	}

	/**
	 * Called when the next workitem was processed and the speech output has started.
	 * @return {undefined}
	 */
	_speakingStarted() {
		this.speaking = true;
		this.speakTimeoutDuration = timeoutDuration;
		this.emit("start", this.current);
	}

	/**
	 * Called when data from the ESpeak fallback dispatcher was received. Refreshes the timeout
	 * and writes the data to the stream if not muted.
	 * @param {array} data - Buffer of data generated.
	 * @param {number} samples - Number of samples generated.
	 * @param {number} samplerate - Samplerate of the generated samples.
	 * @return {undefined}
	 */
	_onESpeakData(data, samples, samplerate) {
		if(!this.speaking) {
			this._speakingStarted();
		}
		const resampledData = Samplerate.resample(data, samplerate, sampleRate, 1);
		if(!this.muted) {
			this.stream.write(resampledData);
		}
		const durationSeconds = samples / samplerate;
		this.speakTimeoutDuration += durationSeconds * msPerSecond;
		this._refreshTimeout();
	}

	/**
	 * Called when data from the TTS dispatcher was received. Refreshes the timeout
	 * and writes the data to the stream if not muted.
	 * @param {array} data - Buffer of data generated.
	 * @return {undefined}
	 */
	_onTTSData(data) {
		if(!this.speaking) {
			this._speakingStarted();
		}
		const resampledData = Samplerate.resample(data, this._currentEngine.samplerate, sampleRate, 1);
		if(!this.muted) {
			this.stream.write(resampledData);
		}
	}

	/**
	 * Mute the playback of TTS data.
	 * @return {undefined}
	 */
	mute() {
		this.muted = true;
	}

	/**
	 * Unmute the playback of TTS data.
	 * @return {undefined}
	 */
	unmute() {
		this.muted = false;
	}

	/**
	 * Changes the gender of the ESpeak TTS module from male to female and
	 * vice-verse. Has no effect on the gender of the Google Translate TTS.
	 * @return {undefined}
	 */
	changeGender() {
		if(this.gender === "male") {
			this.gender = "female";
		}
		else {
			this.gender = "male";
		}
		if(this._bingEngine) {
			this._bingEngine.setGender(this.gender);
		}
		ESpeak.setGender(this.gender);
	}

	/**
	 * Synthesize a text specificly using ESpeak.
	 * @param {string} text - Text to synthesize.
	 * @return {undefined}
	 */
	speakUsingESpeak(text) {
		this._currentEngine = null;
		ESpeak.speak(text);
	}

	/**
	 * Called when an error occured by google tts.
	 * @param {object} err - The error that occured.
	 * @param {string} text - The text that should have been spoken.
	 * @return {undefined}
	 */
	_onGoogleTTSError(err, text) {
		Winston.error("Received error from google tts. Using ESpeak instead. " + err);
		this.speakUsingESpeak(text);
	}

	/**
	 * Called when an error occured by responsive voice tts.
	 * @param {object} err - The error that occured.
	 * @param {string} text - The text that should have been spoken.
	 * @return {undefined}
	 */
	_onResponsiveTTSError(err, text) {
		Winston.error("Received error from responsive tts. Using Google instead. " + err);
		this.speakUsingGoogle(text);
	}

	/**
	 * Called when an error occured by bing tts.
	 * @param {object} err - The error that occured.
	 * @param {string} text - The text that should have been spoken.
	 * @return {undefined}
	 */
	_onBingTTSError(err, text) {
		Winston.error("Received error from bing tts. Using Google instead. " + err);
		this.speakUsingGoogle(text);
	}

	/**
	 * Synthesize a text specificly byusing Google Translate TTS.
	 * @param {string} text - Text to synthesize.
	 * @return {undefined}
	 */
	speakUsingGoogle(text) {
		this._currentEngine = this._googleEngine;
		this._googleEngine.removeAllListeners("error"); //TODO: This is a nasty dirty piece of shit code line
		this._googleEngine.on("error", (err) => this._onGoogleTTSError(err, text));
		this._googleEngine.tts(text);
	}

	/**
	 * Synthesize a text specificly by using Google Translate TTS.
	 * @param {string} text - Text to synthesize.
	 * @return {undefined}
	 */
	speakUsingResponsive(text) {
		this._currentEngine = this._responsiveEngine;
		this._responsiveEngine.removeAllListeners("error"); //TODO: This is a nasty dirty piece of shit code line
		this._responsiveEngine.on("error", (err) => this._responsiveTTSError(err, text));
		this._responsiveEngine.tts(text);
	}

	/**
	 * Synthesize a text specificly by using Bing TTS.
	 * @param {string} text - Text to synthesize.
	 * @return {undefined}
	 */
	speakUsingBing(text) {
		this._currentEngine = this._bingEngine;
		this._bingEngine.removeAllListeners("error"); //TODO: This is a nasty dirty piece of shit code line
		this._bingEngine.on("error", (err) => this._onBingTTSError(err, text));
		this._bingEngine.tts(text);
	}

	/**
	 * Process the next item in the queue.
	 * @return {undefined}
	 */
	_next() {
		if(!this.speaking && this.queue.length !== 0) {
			this.current = this.queue.shift();
			if(this.engine === "google") {
				this.speakUsingGoogle(this.current.text);
			}
			else if(this.engine === "espeak") {
				this.speakUsingESpeak(this.current.text);
			}
			else if(this.engine === "bing") {
				this.speakUsingBing(this.current.text);
			}
			else if(this.engine === "responsive") {
				this.speakUsingResponsive(this.current.text);
			}
			Winston.info("Speaking:\"" + this.current.text + "\"");
			if(this.current.print) {
				this.channel.sendMessage(this.current.text);
			}
		}
	}

	/**
	 * Enqueue a work item to be processed in the queue and being synthesized
	 * later on.
	 * @param {Workitem} workitem - Workitem to enqueue containing text to synthesize as well
	 * 					 as a callback to call once the text was spoken.
	 * @return {undefined}
	 */
	enqueue(workitem) {
		this.queue.push(workitem);
		if(!this.speaking) {
			this._next();
		}
	}
}

export default Speech;
