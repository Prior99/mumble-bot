/*
 * Imports
 */
var FS = require("fs");
var Request = require("request");
var Lame = require("lame");
var Util = require("util");
var EventEmitter = require('events').EventEmitter;
var Winston = require("winston");
var ReadableStream = require('stream').Readable
/*
 * Constants
 */
var RETRIES = 3;
/*
 * Code
 */

/**
 * Provides TTS (Text-To-Speech) by querying (abusing) the any TTS api.
 * @constructor
 * @param {string} url - Base URL to fetch. Query will be appended.
 * @param header - Custom parameters to attach to the header.
 * @param {string} cacheDir - Directory where the TTS MP3 files are cached.
 * @param storeCallback - Will be called with the text to obtain a new id.
 * @param {number} splitAfter - Maximum amount of characters per query.
 */
var CachedWebTTS = function(options) {
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
};

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
function splitTextOnNearestSpace(text, len) {
	var arr = [];
	var found = true;
	while(text.length > len && found) {
		var index = -1;
		var lastIndex;
		while((index = text.indexOf(" ", index + 1)) < len && index !== -1) {
			lastIndex = index;
		}
		if(lastIndex == -1 || index == -1) {
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
}

Util.inherits(CachedWebTTS, ReadableStream);

CachedWebTTS.prototype._read = function() { };

CachedWebTTS.prototype._refreshTimeout = function(time) {
	if(this._time === undefined) {
		this._time = 0;
	}
	this._time += time * 1000;
	if(this._timeout) {
		clearTimeout(this._timeout);
	}
	this._timeout = setTimeout(this._speechDone.bind(this), this._time);
};

CachedWebTTS.prototype._speechDone = function() {
	this._time = 0;
	this._timeout = null;
	this.emit("speechDone");
};

/**
 * Start synthesizing a text. This will trigger this instance to emit data as it
 * is a readable stream.
 * @param {string} text - Text to synthesize.
 */
CachedWebTTS.prototype.tts = function(text) {
	var lame = new Lame.Decoder();
	lame.on('format', function(format) {
		this.samplerate = format.sampleRate;
		lame.on('data', function(data) {
			this._refreshTimeout(data.length / (format.sampleRate * 2));
			this.push(data);
		}.bind(this));
	}.bind(this));
	this._getMP3Stream(text, lame);
};

CachedWebTTS.prototype._getMP3Stream = function(text, stream) {
	var arr;
	if(this.splitAfter) {
		arr = splitTextOnNearestSpace(text, this.splitAfter);
	}
	else {
		arr = [text];
	}
	var next = function() {
		if(arr.length > 0) {
			this._getMP3Part(arr.shift(), function(err, mp3Stream) {
				if(err) {
					//throw err;
					this.emit('error', err);
				} //TODO
				else {
					//mp3Stream.pipe(stream);
					mp3Stream.on('data', function(data) {
						stream.write(data);
					});
					//next();
				}
				next();
			}.bind(this));
		}
	}.bind(this);
	next();
};

CachedWebTTS.prototype._getMP3Part = function(text, callback) {
	this.retrieveCallback(text, function(err, file) {
		if(err) {
			callback(err);
		}
		else {
			if(!file) {
				this._cacheMP3Part(text, function(err) {
					if(err) {
						callback(err);
					}
					else {
						this._getMP3Part(text, callback);
					}
				}.bind(this));
			}
			else {
				this._readMP3PartFromCache(file, callback);
			}
		}
	}.bind(this));
};

CachedWebTTS.prototype._readMP3PartFromCache = function(file, callback) {
	callback(null, FS.createReadStream(this.cacheDir + "/" + file));
};

CachedWebTTS.prototype._cacheMP3Part = function(text, callback) {
	this._retrieveMP3Part(text, function(err, mp3Stream) {
		if(err) {
			callback(err);
		}
		else {
			this.storeCallback(text, function(err, filename) {
				if(err) {
					callback(err);
				}
				else {
					this._saveRetrievedMP3Part(text, mp3Stream, callback, filename);
				}
			}.bind(this));
		}
	}.bind(this));
};

CachedWebTTS.prototype._saveRetrievedMP3Part = function(text, mp3Stream, callback, filename) {
	var writeStream = FS.createWriteStream(this.cacheDir + "/" + filename);
	mp3Stream.on('data',function(data){
		writeStream.write(data);
	});
	mp3Stream.on('end', function() {
		callback(null);
	});
	mp3Stream.resume();
};

CachedWebTTS.prototype._retrieveMP3Part = function(text, callback, tries) {
	if(tries === undefined) {
		tries = 0;
	}
	if(tries > RETRIES) {
		callback(new Error("Could not retrieve speech from tts after 3 tries."));
	}
	var encoded = encodeURIComponent(text);
	var url = this.url + encoded;
	var request = Request.get({
		url : url,
		timeout : 1000,
		headers: this.header
	});
	request.on('response', function(response) {
		if(response.statusCode !== 200) {
			callback(new Error("Could not retrieve speech from tts api. Bad status code: " + response.statusCode));
		}
		else {
			callback(null, request);
			request.end();
		}
	}).on('error', function(err) {
		this._retrieveMP3Part(text, callback, tries + 1);
	}.bind(this));
	request.pause();
};

module.exports = CachedWebTTS;
