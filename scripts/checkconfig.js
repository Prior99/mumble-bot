var config = require("../config.json");

var okay = true;

/**
 * Checks whether the key is contained in the config
 * sets this.okay to false if te key is not contained.
 * @param {string} key The key.
 * @param {object} config The config.
 * @returns {undefined}
 */
var check = function(key, config) {
	if(config[key] === undefined) {
		okay = false;
	}
};

check("url", config);
check("name", config);
//check("key", config);
//check("cert", config);
check("channel", config);
//check("kickChannel", config);
check("website", config);
check("database", config);
check("webpageurl", config);
check("afkWarnTimeout", config);
check("afkTimeout", config);

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
