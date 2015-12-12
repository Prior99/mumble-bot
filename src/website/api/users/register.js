import * as Steam64 from "../../../steam64id";
import * as Winston from "winston";

/**
 * Register a new user on the server.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewRegister = function(bot) {
	/**
	 * Grants all permissions to the user with the id 1. (The first registered user is admin).
	 * @return {undefined}
	 */
	const grantAll = function() {
		bot.database.getUserById(1, (err, user) => {
			if(err) {
				Winston.error("Error when granting all permissions to user with id 0.", err);
			}
			else {
				bot.permissions.grantAllPermissions(null, user);
			}
		});
	}

	return function(req, res) {
		const data = req.query;
		Steam64(data.steamusername, (err, steamid) => {
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
					steamid,
					minecraft : data.minecraft

				}, (err, id) => {
					if(err) {
						if(err.code === "ER_DUP_ENTRY") {
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
						Winston.debug("verbose", "A new user registered: " + data.username);
						res.send({
							okay : true,
							id
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
export default ViewRegister;
