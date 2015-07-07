/*
 * Imports
 */
var Mumble = require("mumble");
var Bot = require("./src");
var Winston = require('winston');
var FS = require('fs');
var Database = require("./src/database");
/*
 * Winston
 */
function fillZero(number, len) {
	number = "" + number;
	while(number.length < len) {
		number = "0" + number;
	}
	return number;
}

Winston.remove(Winston.transports.Console);
Winston.add(Winston.transports.Console, {
	colorize: true,
	timestamp: function() {
		var d = new Date();
		return d.getYear() + 1900 + "-" + fillZero(d.getMonth() + 1, 2) + "-" + fillZero(d.getDate(), 2) + " " +
		fillZero(d.getHours(), 2) + ":" + fillZero(d.getMinutes(), 2) + ":" + fillZero(d.getSeconds(),2);
	}
});

Winston.add(Winston.transports.File, {
	filename : 'bot.log',
	maxsize : '64000',
	maxFiles : 7,
	json: false,
	colorize: true,
	timestamp: function() {
		var d = new Date();
		return d.getYear() + 1900 + "-" + fillZero(d.getMonth() + 1, 2) + "-" + fillZero(d.getDate(), 2) + " " +
		fillZero(d.getHours(), 2) + ":" + fillZero(d.getMinutes(), 2) + ":" + fillZero(d.getSeconds(),2);
	}
});
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

function stopDatabase(database, callback) {
	Winston.info("Stopping database ... ");
	database.stop(function() {
		Winston.info("Database stopped.");
		callback();
	});
}

function stopMumble(connection, callback) {
	Winston.info("Stopping connection to mumble ... ");
	connection.on("disconnect", function() {
		Winston.info("Connection to mumble stopped. ");
		callback();
	});
	connection.disconnect();
}

function databaseStarted(err, connection, database) {
	if(err) {
		throw err;
	}
	else {
		var bot = new Bot(connection, options, database);
		Winston.info("Joining channel: " + options.channel);
		bot.join(options.channel);
		bot.say("Ich grüße euch!");
		bot.on("shutdown", function() {
			stopDatabase(database, function() {
				stopMumble(connection, function() {
					process.exit();
				});
			});
		})
	}
}

function startup(connection) {
	var database = new Database(options.database, function(err) {
		databaseStarted(err, connection, database);
	});
}
