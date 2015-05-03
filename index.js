/*
 * Imports
 */
var Mumble = require("mumble");
var Bot = require("./src/bot.js");
var Winston = require('winston');
var FS = require('fs');
/*
 * Defines
 */

/*
 * Code
 */
var options = require("./config.json");

var mumbleOptions = {};

if(options.key && options.cert) {
	mumbleOptions.key = FS.readFileSync(options.key);
	mumbleOptions.cert = FS.readFileSync(options.cert);
}
else {
	Winston.warn("Connecting without certificate. Connection will be unsecured, bot will not be able to register!");
}

Mumble.connect("mumble://" + options.url, mumbleOptions, function(err, connection) {
	if(err) {
		throw err;
	}
	else {
		connection.authenticate(options.name);
		connection.on('ready', function() {
			startup(connection);
		});
	}
});

function startup(connection) {
	var bot = new Bot(connection, options);
	Winston.info("Joining channel: " + options.channel);
	bot.join(options.channel);
	bot.say("Greetings!");
}
