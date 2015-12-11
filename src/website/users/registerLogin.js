import * as Winston from "winston";

/**
 * This endpoint will be used when a user is not logged in so he can register
 * or login.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - Feeded view renderer for this endpoint.
 */
const ViewUsersRegisterLogin = function(bot) {
	return function(req, res) {
		bot.database.getFreeIdentifiers((err, identifiers) => {
			if(err) {
				Winston.error("Unable to fetch list of identifiers", err);
				res.locals.identifiers = [];
			}
			else {
				res.locals.identifiers = identifiers;
			}
			res.render("users/registerlogin", {
				layout : "registerlogin"
			});
		});
	}
};

export default ViewUsersRegisterLogin;
