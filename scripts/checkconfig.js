var config = require("../config.json");

var okay = true;

function check(key, config) {
	if(config[key] === undefined) {
		okay = false;
	}
}

check("url", config);
check("name", config);
//check("key", config);
//check("cert", config);
check("channel", config);
check("afkChannel", config);
check("kickChannel", config);
check("website", config);
check("database", config);
check("webpageurl", config);

if(config.mpd) {
	//check("fifo", config.mpd);
	check("port", config.mpd);
	check("host", config.mpd);
	check("directory", config.mpd);
}

if(config.bingTTS) {
	check("clientID", config.bingTTS);
	check("clientSecret", config.bingTTS);
}

if(config.minecraft) {
	check("host", config.minecraft);
	check("port", config.minecraft);
}

if(config.steam) {
	check("user", config.steam);
	check("password", config.steam);
}

if(config.website) {
	check("port", config.website);
	check("tmp", config.website);
	check("sessionSecret", config.website);
}

if(config.database) {
	check("host", config.database);
	check("user", config.database);
	check("password", config.database);
	check("database", config.database);
}

if(!okay) {
	process.exit(1);
}
else {
	process.exit(0);
}
