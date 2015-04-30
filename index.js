var Mumble = require("mumble");
var ESpeak = require("node-espeak");
var Samplerate = require("samplerate");
var FS = require("fs");

var options = require("./config");

ESpeak.initialize();

var connection;
var inputStreamMumble;

function startup(_connection) {
	connection = _connection;
	connection.authenticate(options.name);
	connection.on("initialized", function() {
		inputStreamMumble = connection.inputStream();
		ESpeak.speak("Initialized!");
	});
	connection.on("textMessage", function(data) {
		//ESpeak.speak(data.message);
	});
}

setInterval(function() {
	ESpeak.speak("Lorem Ipsum Dolor Sit Amet!");
}, 2000);

ESpeak.onVoice(function(wav, samples, samplerate) {
	var resampled = Samplerate.resample(wav, samplerate, 48000, 1);
	inputStreamMumble.write(resampled);
});

Mumble.connect("mumble://" + options.url, options.mumbleOptions, function(err, connection) {
	if(err) {
		throw err;
	}
	else {
		startup(connection);
	}
});
