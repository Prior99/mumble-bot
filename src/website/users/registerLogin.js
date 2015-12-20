import * as Winston from "winston";

/**
 * This endpoint will be used when a user is not logged in so he can register
 * or login.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - Feeded view renderer for this endpoint.
 */
const ViewUsersRegisterLogin = function(bot) {
	return async function(req, res) {
		try {
			const identifiers = await bot.database.getFreeIdentifiers();
			res.locals.identifiers = identifiers;
			res.render("users/registerlogin", {
				layout : "registerlogin"
			});
		}
		catch(err) {
			Winston.error("Unable to fetch list of identifiers", err);
			res.locals.identifiers = [];
		}
	}
};

export default ViewUsersRegisterLogin;
