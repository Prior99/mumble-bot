/*
 * Includes
 */
var parseXML = require('xml2js').parseString;
var Request = require('request');
/*
 * Code
 */

/**
 * Retrieves the steam64 id by the username of a specified user on steam.
 * This is done by opening their profile as xml and parsing it.
 * @param {string} username - Username of the steam user to retrieve the id of.
 * @param callback - Called once the id was retrieved.
 */
module.exports = function(username, callback) {
	Request("http://steamcommunity.com/id/" + username + "?xml=1", function(err, response, body) {
		if(err) {
			callback(err);
		}
		else {
			if(response.statusCode !== 200) {
				callback(new Error("Non-okay status code when fetching steamcommunity.com"));
			}
			else {
				parseXML(body, function (err, result) {
					if(result) {
						if(result.profile && result.profile.steamID64 && result.profile.steamID64.length > 0) {
							callback(null, result.profile.steamID64[0]);
						}
						else {
							callback(null, null);
						}
					}
				});
			}
		}
	});
};