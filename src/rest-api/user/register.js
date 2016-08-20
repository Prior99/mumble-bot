import * as Winston from "winston";

/**
 * Register a new user on the server.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewRegister = function(bot) {
	/**
	 * <b>Async</b> Grants all permissions to the user with the id 1. (The first registered user is admin).
	 * @return {undefined}
	 */
	const grantAll = async function() {
		try {
			const user = await bot.database.getUserById(1);
			bot.permissions.grantAllPermissions(null, user);
		}
		catch(err) {
			Winston.error("Error when granting all permissions to user with id 0.", err);
		}
	}

	return async function(req, res) {
		const data = req.query;
		try {
			const id = await bot.database.registerUser({
				email : data.email,
				username : data.username,
				password : data.password
			});
			Winston.debug("verbose", "A new user registered: " + data.username);
			res.send({
				okay : true,
				id
			});
			if(id === 1) {
				grantAll();
			}
		}
		catch(err) {
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
	}
};
export default ViewRegister;
