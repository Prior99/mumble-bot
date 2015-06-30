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
var TTS = function(cacheDir, database) {
	ReadableStream.call(this);
	this.stream = new ReadableStream();
	this.cacheDir = cacheDir ? cacheDir : "google-tts-cache";
	this.database = database;
	try {
		FS.mkdirSync(this.cacheDir);
	}
	catch(e) {
		if(e.code !== "EEXIST") {
			throw e;
		}
	}
};

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

Util.inherits(TTS, ReadableStream);

TTS.prototype._read = function() { };

TTS.prototype._refreshTimeout = function(time) {
	if(this._time === undefined) {
		this._time = 0;
	}
	this._time += time * 1000;
	if(this._timeout) {
		clearTimeout(this._timeout);
	}
	console.log("waiting for additional " + time + "s");
	console.log("waiting for " + this._time/1000 + "s");
	this._timeout = setTimeout(this._speechDone.bind(this), this._time);
};

TTS.prototype._speechDone = function() {
	this._time = 0;
	this._timeout = null;
	this.emit("speechDone");
};

TTS.prototype.tts = function(text) {
	var lame = new Lame.Decoder();
	lame.on('format', function(format) {
		console.log(format);
		this.samplerate = format.sampleRate;
		lame.on('data', function(data) {
			this._refreshTimeout(data.length / (format.sampleRate * 2));
			this.push(data);
		}.bind(this));
	}.bind(this));
	this._getMP3Stream(text, lame);
};

TTS.prototype._getMP3Stream = function(text, stream) {
	var arr = splitTextOnNearestSpace(text, 90);
	console.log(arr)
	var next = function() {
		if(arr.length > 0) {
			this._getMP3Part(arr.shift(), function(err, mp3Stream) {
				/*if(err) {
					stream.emit("error", err);
					stream.push(null);
				}*/ //TODO
				//mp3Stream.pipe(stream);
				mp3Stream.on('data', function(data) {
					stream.write(data);
				});
				next();
			});
		}
	}.bind(this);
	next();
};

TTS.prototype._getMP3Part = function(text, callback) {
	this.database.getCachedTTS(text, function(err, file) {
		if(err) {
			callback(err);
		}
		else {
			if(!file) {
				this._cacheMP3Part(text, function(err) {
					if(err) {
						throw err;
					}
					this._getMP3Part(text, callback);
				}.bind(this));
			}
			else {
				this._readMP3PartFromCache(file, callback);
			}
		}
	}.bind(this));
};

TTS.prototype._readMP3PartFromCache = function(file, callback) {
	callback(null, FS.createReadStream(this.cacheDir + "/" + file));
};

TTS.prototype._cacheMP3Part = function(text, callback) {
	this.database.addCachedTTS(text, function(err, filename) {
		if(err) {
			callback(err);
		}
		else {
			this._retrieveMP3Part(text, function(err, mp3Stream) {
				if(err) {
					callback(err);
				}
				else {
					//console.log(data);
					this._saveRetrievedMP3Part(text, mp3Stream, callback, filename);
				}
			}.bind(this));
		}
	}.bind(this));
};

TTS.prototype._saveRetrievedMP3Part = function(text, mp3Stream, callback, filename) {
	mp3Stream.on('end', function() {
		callback(null);
	});
	mp3Stream.pipe(FS.createWriteStream(this.cacheDir + "/" + filename));
};

TTS.prototype._retrieveMP3Part = function(text, callback, tries) {
	if(tries === undefined) {
		tries = 0;
	}
	if(tries > RETRIES) {
		callback(new Error("Could not retrieve speech from google after 3 tries. Falling back to espeak!"), text);
	}

	var encoded = encodeURIComponent(text);
	var url = "http://translate.google.com/translate_tts?tl=de&q=" + encoded;
	console.log(url);

	var request = Request.get({
		url : url,
		timeout : 1000,
		headers: {
			'Host' : "translate.google.com",
			'Referer' : "http://gstatic.com/translate/sound_player.swf",
			'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.82 Safari/537.36'
		}
	});
	request.end();
	request.on('response', function(response) {
		if(response.statusCode !== 200) {
			callback(new Error("Could not retrieve speech from google. Bad status code: " + response.statusCode + " Falling back to espeak!"));
		}
		else {
			callback(null, request);
		}
	}).on('error', function(err) {
		this._retrieveMP3Part(text, callback, tries + 1);
	}.bind(this));
};

module.exports = TTS;
