var Steam64 = require("../../../steam64id");
var Winston = require('winston');

module.exports = function(bot) {

	function grantAll() {
		bot.database.getUserById(1, function(err, user) {
			if(err) {
				Winston.error("Error when granting all permissions to user with id 0.", err);
			}
			else {
				bot.permissions.grantAllPermissions(null, user);
			}
		});
	}

	return function(req, res) {
		var data = req.query;
		console.log(data);
		Steam64(data.steamusername, function(err, steamid) {
			if(err && data.steamusername) {
				res.send({
					okay : false,
					reason : "error_fetching_steamid"
				});
			}
			else if(!steamid && data.steamusername) {
				res.send({
					okay : false,
					reason : "unknown_steam_username"
				});
			}
			else {
				bot.database.registerUser({
					email : data.email,
					username : data.username,
					password : data.password,
					identifier : data.identifier,
					steamid : steamid,
					minecraft : data.minecraft

				}, function(err, id) {
					if(err) {
						if(err.code == "ER_DUP_ENTRY") {
							res.send({
								okay : false,
								reason : "username_taken"
							});
						}
						else {
							Winston.error("Error registering new user: ", err);
							res.send({
								okay : false,
								reason : "internal_error"
							});
						}
					}
					else {
						Winston.debug('verbose', "A new user registered: " + data.username);
						res.send({
							okay : true,
							id : id
						});
						if(id === 1) {
							grantAll();
						}
					}
				});
			}
		});
	}
};
