var Mumble = require("mumble");
var ESpeak = require("node-espeak");
var Samplerate = require("samplerate");
var FS = require("fs");

var options = require("./config");

var connection;
var is;

function startup(_connection) {
	connection = _connection;
	connection.authenticate(options.name);
	connection.on("initialized", function() {
		is = connection.inputStream();
		ESpeak.speak("Initialized!");
		setInterval(function() {
			ESpeak.speak("Lorem Ipsum Dolor Sit Amet!");
		}, 2000);
		FS.createReadStream("out.pcm").pipe(connection.inputStream());
	});
	connection.on("textMessage", function(data) {
		//ESpeak.speak(data.message);
	});
}


var outs = FS.createWriteStream("out.pcm");
var ins = FS.createWriteStream("in.pcm");

ESpeak.initialize();
ESpeak.onVoice(function(wav, samples, samplerate) {
	var resampled = Samplerate.resample(wav, samplerate, 48000, 1);

	ins.write(wav);
	outs.write(resampled);

	is.write(resampled);

	console.log("  Samples: " + samples);
	console.log("  Samplerate: " + samplerate);
	console.log("  BufferLenght after conversion: " + resampled.length);
	console.log("------");
});

Mumble.connect("mumble://" + options.url, options.mumbleOptions, function(err, connection) {
	if(err) {
		throw err;
	}
	else {
		startup(connection);
	}
});
