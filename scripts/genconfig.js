var Prompt = require('prompt');
var FS = require('fs');

Prompt.message = "";
Prompt.delimiter = "";
Prompt.colors = false;

var schema = {
	properties: {
		url : {
			default : "localhost",
			message : "Please enter an ip adress or hostname!",
			description : "What is the hostname or ip address of the mumble server you want to connect to? ",
			required : true
		},
		name : {
			message : "Please enter the name of the bot.",
			description : "What should the bot be named like? ",
			required : true
		},
		channel : {
			message : "Enter the name of a channel.",
			default : "Root",
			description : "Enter the name of the channel the bot should automatically join:",
			required : true
		},
		webpageurl : {
			message : "Please enter the url on which the website can be reached.",
			default : "http://localhost/",
			description : "What is the external URL to reach the website on?",
			required : true
		},
		audioCacheAmount : {
			required : false,
			default : 100,
			pattern : /\d+/,
			message : "Enter the amount of records you want to keep.",
			description : "How many temporary records do you want to keep?"
		}
	}
};

var website = {
	properties : {
		port : {
			required : true,
			default : 23278,
			pattern : /\d+/,
			message : "Enter a valid port number.",
			description : "What port do you want the webserver to run on?"
		},
		tmp : {
			required : true,
			default : "tmp/",
			message : "Enter a valid directory.",
			description : "In which directory should temporary files be stored in?"
		},
		sessionSecret : {
			required : true,
			message : "Enter something!",
			description : "Please enter a random string to encrypt the session storage with, or if you already have a session storage, enter its key:"
		}
	}
};

var db = {
	properties : {
		host : {
			required : true,
			default : "localhost",
			message : "Please enter a host!",
			description : "What host does the database run on? "
		},
		user : {
			required : true,
			message : "Enter a valid username!",
			description : "Which user should be used to log in to the database? "
		},
		password : {
			required : false,
			description : "What password does the user use? "
		},
		database : {
			required : true,
			message : "Enter the name of a database!",
			description : "What is the name of the database to use? "
		}
	}
};


Prompt.start();

function confirm(results) {
	results.key = "./bot.key";
	results.cert = "./bot.cert";
	console.log("This will be the content of your configfile:");
	var json = JSON.stringify(results, null, 4);
	console.log(json);
	Prompt.get({
			validator: /y[es]*|n[o]?/,
			required: true,
			default: "yes",
			warning: "Answer 'yes' or 'no'!",
			message: "Is that okay?"
	}, function(err, okay) {
		if(okay) {
			FS.writeFile("config.json", json, function(err) {
				if(!err) {
					process.exit(0);
				}
				else {
					process.exit(1);
				}
			});
		}
		else {
			startOver();
		}
	});
}

function getDatabase(callback) {
	Prompt.get(db, function(err, db) {
		callback(db);
	});
}

function getWebsite(callback) {
	Prompt.get(website, function(err, website) {
		callback(website);
	});
}


function startOver() {
	Prompt.get(schema, function(err, results) {
		function websiteDone(website) {
			results.website = website;
			confirm(results);
		}
		function databaseDone(db) {
			results.database = db;
			getWebsite(websiteDone);
		}
		getDatabase(databaseDone);
	});
};

Prompt.confirm("Do you want to generate a configfile interactivly? (yes/no)", function(err, okay) {
	if(okay) {
		startOver();
	}
	else {
		process.exit(1);
	}
});
