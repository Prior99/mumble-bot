import * as FS from "fs";
import * as Request from "request";
import * as Lame from "lame";
import EventEmitter from "events";
import * as Winston from "winston";
import {Readable as ReadableStream} from "stream"

const RETRIES = 3;

/**
 * Split the text on the nearest whitespace. This way the text can be split into
 * chunks of a specified maximum length but will not be split in the middle of a
 * word. This is important as the Google Translate TTS api will only accept
 * string with less than 100 characters. If there are chunks longer than maximum
 * characters without a whitespace they will be outputted as chunks longer than
 * this length.
 * @param {string} text - Text to split.
 * @param {number} len - Maximum length of a chunk.
 * @return {string[]} Array of strings smaller than the maximum length.
 */
const splitTextOnNearestSpace = function(text, len) {
	const arr = [];
	let found = true;
	while(text.length > len && found) {
		let index = -1;
		let lastIndex;
		while((index = text.indexOf(" ", index + 1)) < len && index !== -1) {
			lastIndex = index;
		}
		if(lastIndex === -1 || index === -1) {
			found = false;
			break;
		}
		else {
			arr.push(text.substring(0, lastIndex));
			text = text.substring(lastIndex, text.length);
		}
	}
	arr.push(text);
	return arr;
};

/**
 * Provides TTS (Text-To-Speech) by querying (abusing) any TTS apis.
 */
class CachedWebTTS extends ReadableStream {
	/**
	 * @constructor
	 * @param {object} options - Options with which the cached webb tts will be configured.
	 * @param {string} options.url - Base URL to fetch. Query will be appended.
	 * @param {object} options.header - Custom parameters to attach to the header.
	 * @param {string} options.cacheDir - Directory where the TTS MP3 files are cached.
	 * @param {callback} options.storeCallback - Will be called with the text to obtain a new id.
	 * @param {number} options.splitAfter - Maximum amount of characters per query.
	 */
	constructor(options) {
		super();
		ReadableStream.call(this);
		this.stream = new ReadableStream();
		this.cacheDir = options.cacheDir ? options.cacheDir : "tts-cache";
		this.splitAfter = options.splitAfter;
		this.header = options.header;
		this.url = options.url;
		this.retrieveCallback = options.retrieveCallback;
		this.storeCallback = options.storeCallback;
		try {
			FS.mkdirSync(this.cacheDir);
		}
		catch(e) {
			if(e.code !== "EEXIST") {
				throw e;
			}
		}
	}

	/**
	 * TODO: Figure out why this is here.
	 * @return {undefined}
	 */
	_read() {

	}

	/**
	 * Refresh the timeout until the speaking is done with the given time.
	 * @param {number} time - Time in seconds with which to refresh the timeout.
	 * @return {undefined}
	 */
	_refreshTimeout(time) {
		if(this._time === undefined) {
			this._time = 0;
		}
		const msPerSecond = 1000;
		this._time += time * msPerSecond;
		if(this._timeout) {
			clearTimeout(this._timeout);
		}
		this._timeout = setTimeout(this._speechDone.bind(this), this._time);
	}

	/**
	 * Called when everything is done with the current synthesizing. Clear the timeout and the current time
	 * and emit respective event.
	 * @return {undefined}
	 */
	_speechDone() {
		this._time = 0;
		this._timeout = null;
		this.emit("speechDone");
	}

	/**
	 * Start synthesizing a text. This will trigger this instance to emit data as it
	 * is a readable stream.
	 * @param {string} text - Text to synthesize.
	 * @return {undefined}
	 */
	tts(text) {
		const lame = new Lame.Decoder();
		lame.on("format", (format) => {
			this.samplerate = format.sampleRate;
			lame.on("data", (data) => {
				this._refreshTimeout(data.length / (format.sampleRate * 2));
				this.push(data);
			});
		});
		this._getMP3Stream(text, lame);
	}

	/**
	 * Somehow gather the mp3 stream and pipe it to the passed stream.
	 * @param {string} text - The text to synthesize.
	 * @param {WritableStream} stream - Stream to write to.
	 * @return {undefined}
	 */
	_getMP3Stream(text, stream) {
		let arr;
		if(this.splitAfter) {
			arr = splitTextOnNearestSpace(text, this.splitAfter);
		}
		else {
			arr = [text];
		}
		const next = function() {
			if(arr.length > 0) {
				this._getMP3Part(arr.shift(), (err, mp3Stream) => {
					if(err) {
						//throw err;
						this.emit("error", err);
					} //TODO
					else {
						//mp3Stream.pipe(stream);
						mp3Stream.on("data", (data) => {
							stream.write(data);
						});
						//next();
						next();
					}
				});
			}
		}.bind(this);
		next();
	}

	/**
	 * Get one mp3 part of the whole audio.
	 * @param {string} text - The text to synthesize.
	 * @param {callback} callback - Called when the part was obtained.
	 * @return {undefined}
	 */
	_getMP3Part(text, callback) {
		this.retrieveCallback(text, (file) => {
			if(!file) {
				this._cacheMP3Part(text, (err) => {
					if(err) {
						callback(err);
					}
					else {
						this._getMP3Part(text, callback);
					}
				});
			}
			else {
				this._readMP3PartFromCache(file, callback);
			}
		});
	}

	/**
	 * Read the file from the cache.
	 * @param {string} file - Filename of the file to read.
	 * @param {callback} callback - Called with the stream and no error.
	 * @return {undefined}
	 */
	_readMP3PartFromCache(file, callback) {
		callback(null, FS.createReadStream(this.cacheDir + "/" + file));
	}

	/**
	 * Retrieve the mp3 part from the web and cache it
	 * @param {string} text - Text to synthesize.
	 * @param {callback} callback - Called with the stream to the audio and or an
	 *                              error as first argument if one occured.
	 * @return {undefined}
	 */
	_cacheMP3Part(text, callback) {
		this._retrieveMP3Part(text, (err, mp3Stream) => {
			if(err) {
				callback(err);
			}
			else {
				this.storeCallback(text, (filename) => {
					this._saveRetrievedMP3Part(text, mp3Stream, callback, filename);
				});
			}
		});
	}

	/**
	 * Save the retrieved mp3 part to disk.
	 * @param {string} text - Text to synthesize.
	 * @param {ReadableStream} mp3Stream - Stream of the mp3 part.
	 * @param {callback} callback - Callback which will be called when all data was written.
	 * @param {string} filename - Filename of the file to write the mp3 data to.
	 * @return {undefined}
	 */
	_saveRetrievedMP3Part(text, mp3Stream, callback, filename) {
		const writeStream = FS.createWriteStream(this.cacheDir + "/" + filename);
		mp3Stream.on("data", (data) => writeStream.write(data));
		mp3Stream.on("end", () => callback(null));
		mp3Stream.resume();
	}

	/**
	 * Retrieve mp3 part from the actual api by downloading it.
	 * @param {string} text - Text to synthesize.
	 * @param {callback} callback - Callback called when the retrieving was done.
	 * @param {number} tries - How often the api was already queried due to errors. After 3 tries it will be aborted.
	 * @return {undefined}
	 */
	_retrieveMP3Part(text, callback, tries) {
		if(tries === undefined) {
			tries = 0;
		}
		if(tries > RETRIES) {
			callback(new Error("Could not retrieve speech from tts after 3 tries."));
			return;
		}
		const encoded = encodeURIComponent(text);
		const url = this.url + encoded;
		const request = Request.get({
			url,
			timeout : 1000,
			headers: this.header
		});
		const httpStatusOkay = 200;
		request.on("response", (response) => {
			if(response.statusCode !== httpStatusOkay) {
				callback(new Error("Could not retrieve speech from tts api. Bad status code: " + response.statusCode));
			}
			else {
				callback(null, request);
				request.end();
			}
		}).once("error", (err) => {
			this._retrieveMP3Part(text, callback, tries + 1);
			request.end();
		});
		request.pause();
	}
}

export default CachedWebTTS;
