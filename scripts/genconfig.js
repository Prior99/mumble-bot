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
		afkChannel : {
			message : "Enter the name of a channel to move afk users to.",
			default : "Root",
			description : "Enter the name of the channel the bot should move users that are afk to:",
			required : true
		},
		afkWarnTimeout : {
			message : "Enter the amount of time after which a user should be warned about AFK in seconds.",
			default : 300,
			pattern : /\d+/,
			description : "After how long should a user be warned about AFK? (Seconds)",
			required : true
		},
		afkTimeout : {
			message : "Enter the amount of time after which a user should be moved to the AFK channel in seconds.",
			default : 360,
			pattern : /\d+/,
			description : "After how long should a user be moved into the AFK channel? (Seconds)",
			required : true
		},
		webpageurl : {
			message : "Please enter the url on which the website can be reached.",
			default : "http://localhost/",
			description : "What is the external URL to reach the website on?",
			required : true
		},
		kickChannel : {
			message : "Enter the name of a channel to move kicked users as well as unknown users into. Leave this blank if you do not want to kick users or have unknown users moved.",
			default : "Root",
			description : "Which channel should users be moved to which were kicked by the bot or are unknown?",
			required : false
		},
		mpd : {
			pattern : /true|false/,
			message : "This must be either true or false.",
			description : "Do you want to enable streaming music from a MPD to mumble?",
			required : true,
			default : false
		},
		steam : {
			pattern : /true|false/,
			message : "This must be either true or false.",
			description : "Do you want the bot to connect to steam?",
			required : true,
			default : false
		},
		minecraft : {
			pattern : /true|false/,
			message : "This must be either true or false.",
			description : "Do you want the bot to connect to a minecraft server? The server must be in offline mode.",
			required : true,
			default : false
		},
		audioCacheAmount : {
			required : false,
			default : 100,
			pattern : /\d+/,
			message : "Enter the amount of records you want to keep.",
			description : "How many temporary records do you want to keep?"
		},
		rssFetchInterval : {
			required : true,
			default : 300,
			pattern : /\d+/,
			message : "How often should the rss feed be updated?"
		}
	}
};

var mpd = {
	properties : {
		fifo : {
			message : "Please enter the path to the fifo mpd will output the music to, if you want to have it played back.",
			description : "Please enter the path to the fifo where mpd will write the raw PCM audio data to:"
		},
		port : {
			required : true,
			default : 6601,
			pattern : /\d+/,
			message : "Enter a valid port number.",
			description : "Which port does mpd accept commands on?"
		},
		host : {
			required : true,
			default : "localhost",
			message : "Enter a valid hostname or ip address.",
			description : "What host does the mpd run on?"
		},
		directory : {
			required : true,
			message : "Enter a valid directory.",
			description : "Enter the path to the directory mpd stores it's music in:"
		}
	}
};

var announce = {
	properties : {
		connect : {
			pattern : /true|false/,
			default : false,
			required : false,
			message : "Set this to false if you do not want the bot to announce users connecting:"
		},
		move : {
			pattern : /true|false/,
			default : false,
			required : false,
			message : "Set this to false if you do not want the bot to announce users moving:"
		},
		disconnect : {
			pattern : /true|false/,
			default : false,
			required : false,
			message : "Set this to false if you do not want the bot to announce users disconnecting:"
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

var steam = {
	properties : {
		user : {
			required : true,
			message : "Enter a username.",
			description : "Which username should be used to connect to steam?"
		},
		password : {
			required : true,
			message : "Enter a password.",
			description : "What is this accounts password? Please note: Password will be stored in plain text!"
		}
	}
};

var minecraft = {
	properties : {
		host : {
			required : true,
			default : "localhost",
			message : "Enter a valid hostname or ip address.",
			description : "What host does the minecraft server run on?"
		},
		port : {
			required : true,
			default : 25565,
			pattern : /\d+/,
			message : "Enter a valid port number.",
			description : "Please enter the port of the minecraft server:"
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

function getMPD(active, callback) {
	if(!active) {
		callback(null);
	}
	else {
		Prompt.get(mpd, function(err, mpd) {
			callback(mpd);
		});
	}
}

function getMinecraft(active, callback) {
	if(!active) {
		callback(null);
	}
	else {
		Prompt.get(minecraft, function(err, minecraft) {
			callback(minecraft);
		});
	}
}

function getSteam(active, callback) {
	if(!active) {
		callback(null);
	}
	else {
		Prompt.get(steam, function(err, steam) {
			callback(steam);
		});
	}
}
function getAnnounce(callback) {
	Prompt.get(announce, function(err, announce) {
		callback(announce);
	});
}

function getWebsite(callback) {
	Prompt.get(website, function(err, website) {
		callback(website);
	});
}


function startOver() {
	Prompt.get(schema, function(err, results) {
		function mpdDone(mpd) {
			if(!mpd) {
				delete results.mpd;
			}
			else {
				results.mpd = mpd;
			}
			getSteam(results.steam === 'true', steamDone);
		}
		function steamDone(steam) {
			if(!steam) {
				delete results.steam;
			}
			else {
				results.steam = steam;
			}
			getMinecraft(results.minecraft === 'true', minecraftDone);
		}
		function minecraftDone(minecraft) {
			if(!minecraft) {
				delete results.minecraft;
			}
			else {
				results.minecraft = minecraft;
			}
			getAnnounce(announceDone);
		}

		function announceDone(announce)  {
			if(!announce) {
				delete results.announce;
			}
			else {
				results.announce = announce;
			}
			getWebsite(websiteDone);
		}

		function websiteDone(website) {
			results.website = website;
			confirm(results);
		}
		function databaseDone(db) {
			results.database = db;
			getMPD(results.mpd === 'true', mpdDone);
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
