var Mumble = require("mumble");
var ESpeak = require("node-espeak");
var Samplerate = require("samplerate");

var options = require("./config");

var connection;

function startup(_connection) {
	connection = _connection;
	connection.authenticate(options.name);
	connection.on("initialized", function() {
		ESpeak.speak("Initialized!");
		setInterval(function() {
			ESpeak.speak("Hello, World. I love you!");
		}, 2000);
	});
	connection.on("textMessage", function(data) {
		ESpeak.speak(data.message);
	});
}


ESpeak.initialize();
ESpeak.onVoice(function(wav, samples, samplerate) {
	connection.inputStream().write(Samplerate.resample(wav, samplerate, 48000, 2, samples));
	console.log("Samples: " + samples);
	console.log("Samplerate: " + samplerate);
});

Mumble.connect("mumble://" + options.url, options.mumbleOptions, function(err, connection) {
	if(err) {
		throw err;
	}
	else {
		startup(connection);
	}
});
