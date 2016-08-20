import * as Winston from "winston";
/**
 * This view can login a user.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewLogin = function(bot) {
	return async function(req, res) {
		/**
		 * <b>Async</b> Try to login a user.
		 * @param {string} username - The user to be logged in.
		 * @return {undefined}
		 */
		const login = async function(username) {
			try {
				const user = await bot.database.getUserByUsername(username);
				const has = await bot.permissions.hasPermission(user, "login");
				if(has) {
					req.session.user = user;
					Winston.log("verbose", req.session.user.username + " logged in.");
					res.send({
						okay : true
					});
				}
				else {
					res.send({
						okay : false,
						reason : "insufficient_permission"
					});
				}
			}
			catch(err) {
				Winston.error("Error logging in user", err);
				res.send({
					okay : false,
					reason : "internal_error"
				});
			}
		}

		if(req.session.user) {
			res.send({
				okay : false,
				reason : "already_logged_in"
			});
		}
		else {
			try {
				const okay = await bot.database.checkLoginData(req.query.username, req.query.password);
				if(okay) {
					login(req.query.username);
				}
				else {
					res.send({
						okay : false,
						reason : "unknown_username_or_password"
					});
				}
			}
			catch(err) {
				Winston.error("Error checking whether user exists", err);
				res.send({
					okay : false,
					reason : "internal_error"
				});
			}
		}
	}
};

export default ViewLogin;
