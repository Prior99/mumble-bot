import * as Winston from "winston";
import HTTPCodes from "../../http-codes";

/**
 * <b>/api/users/linkMumbleUser</b> Links a mumble user to a user.
 * server this bot is connected to.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const LinkMumbleUser = function(bot) {
	return async function(req, res) {
		if(req.user.username === req.body.username) {
			try {
				await bot.database.linkMumbleUser(req.body.id, req.body.username);
				Winston.log("verbose", `${req.user.username} linked mumble user with id ${req.body.id}`);
				res.status(HTTPCodes.okay).send(true);
			}
			catch(err) {
				res.status(HTTPCodes.internalError).send({
					reason : "internal_error"
				});
			}
		}
		else {
			res.status(HTTPCodes.invalidRequest).send({
				reason : "invalid_user"
			});
		}
	};
};

export default LinkMumbleUser;
