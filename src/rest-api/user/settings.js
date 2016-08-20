import * as Winston from "winston";
import HTTPCodes from "../../httpcodes";

/**
 * Apply the settings from the api callback to the database and reload the session.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewSettings = function(bot) {
	/**
	 * <b>Async</b> Apply settings to the database.
	 * @param {object} settings - The settings object containing the modified settings for the user.
	 *                            The keys represent the setting-keys as well as the values the changed values.
	 * @param {number} user - The numerical user id of the user to change.
	 * @return {undefined}
	 */
	const applySettings = async function(settings, user) {
		for(const setting of settings) {
			await bot.database.setSetting(user, setting.key, setting.val);
		}
	};

	/**
	 * <b>Async</b> Reload the user in the session from the database.
	 * @param {object} req - The request from express.
	 * @return {undefined}
	 */
	const reloadUser = async function(req) {
		const user = await bot.database.getUserById(req.session.user.id);
		req.session.user = user;
	};

	return function(req, res) {
		const settings = [];
		if(req.query.record) {
			settings.push({ key : "record", val : req.query.record });
		}
		try {
			applySettings(settings, req.session.user);
			try {
				reloadUser(req);
				res.status(HTTPCodes.okay).send({
					okay : true
				});
			}
			catch(err) {
				Winston.error("Error reloading user into session.", err);
				res.status(HTTPCodes.internalError).send({
					okay : false,
					reason : "internal_error"
				});
			}
		}
		catch(err) {
			Winston.error("An error occured while saving settings for user " + req.session.user.username, err);
			res.status(HTTPCodes.internalError).send({
				okay : false,
				reason : "internal_error"
			});
		}
	};
};

export default ViewSettings;
