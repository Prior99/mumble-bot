import * as Winston from "winston";
import HTTPCodes from "../httpcodes";

/**
 * This handles the /users/settings endpoint handling all the stuff for linking
 * mumble users and the possible settings.
 * @param {object} bot - Pointer to the main bot instance.
 * @return {ViewRenderer} - Feeded view renderer for this endpoint.
 */
const ViewSettings = function(bot) {
	return async function(req, res) {
		let user = req.session.user;
		try {
			user = await bot.database.getUserByUsername(user.username); //Reload user from database
			if(user) {
				res.send({
					okay: true,
					user
				});
			}
			else {
				res.status(HTTPCodes.notFound).send({
					okay: false,
					reason: "internal_error"
				});
			}
		}
		catch(err) {
			Winston.error("Error fetching user " + user.id + ".", err);
			res.status(HTTPCodes.internalError).send({
				okay: false,
				reason: "internal_error"
			});
		}
	};
};

export default ViewSettings;
