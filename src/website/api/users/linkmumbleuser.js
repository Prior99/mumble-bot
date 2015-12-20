import * as Winston from "winston";
import * as HTTPCodes from "../../httpcodes";

/**
 * <b>/api/users/linkMumbleUser</b> Links a mumble user to a user.
 * server this bot is connected to.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewAPIUsersLinkMumbleUser = function(bot) {
	return async function(req, res) {
		if(req.session.user.username === req.query.username) {
			try {
				await bot.database.linkMumbleUser(req.query.id, req.query.username);
				Winston.log("verbose", req.session.user.username + " linked mumble user with id " + req.query.id);
				res.status(HTTPCodes.okay).send({
					okay : true
				});
			}
			catch(err) {
				res.status(HTTPCodes.internalError).send({
					okay : false,
					reason : "internal_error"
				});
			}
		}
		else {
			res.status(HTTPCodes.invalidRequest).send({
				okay : false,
				reason : "invalid_user"
			});
		}
	};
};

export default ViewAPIUsersLinkMumbleUser;
