var Mumble = require("mumble");
var ESpeak = require("node-espeak");
var Samplerate = require("samplerate");
var FS = require("fs");

var options = require("./config");

ESpeak.initialize({
	lang : "de",
	gender : "female",
	age : 50,
	variant: 0
});
ESpeak.setProperties({
	range : 30,
	pitch: 90
});
console.log(ESpeak.getVoice());
console.log(ESpeak.getProperties());

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
	ESpeak.speak("Hallo Welt ich esse gerne Käse!");
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
