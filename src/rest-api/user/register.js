import * as Winston from "winston";

/**
 * <b>Async</b> Grants all permissions to the user with the id 1. (The first registered user is admin).
 * @return {undefined}
 */
async function grantAll(bot) {
	try {
		const user = await bot.database.getUserById(1);
		bot.permissions.grantAllPermissions(null, user);
	}
	catch(err) {
		Winston.error("Error when granting all permissions to user with id 0.", err);
	}
}

/**
 * Register a new user on the server.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const Register = function(bot) {
	return async function(req, res) {
		const { email, username, password } = req.body;
		try {
			const id = await bot.database.registerUser({ email, username, password });
			Winston.debug("verbose", `A new user registered: ${data.username}`);
			if(id === 1) {
				Winston.debug("verbose", `Granted all permissions to user '${data.username}'`);
				grantAll();
			}
			res.send({ id });
		}
		catch(err) {
			if(err.code === "ER_DUP_ENTRY") {
				res.send({
					reason : "username_taken"
				});
			}
			else {
				Winston.error("Error registering new user: ", err);
				res.send({
					reason : "internal_error"
				});
			}
		}
	}
};
export default Register;
