import * as Winston from "winston";
import * as HTTPCodes from "../../httpcodes";

/**
 * Apply the settings from the api callback to the database and reload the session.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewSettings = function(bot) {
	/**
	 * Apply settings to the database.
	 * @param {object} settings - The settings object containing the modified settings for the user.
	 *                            The keys represent the setting-keys as well as the values the changed values.
	 * @param {number} user - The numerical user id of the user to change.
	 * @param {VoidCallback} callback - Called once all settings were changed in the database.
	 * @return {undefined}
	 */
	const applySettings = function(settings, user, callback) {
		const next = function() {
			const setting = settings.pop();
			bot.database.setSetting(user, setting.key, setting.val, (err) => {
				if(err) {
					callback(err);
				}
				else {
					if(settings.length > 0) {
						next();
					}
					else {
						callback();
					}
				}
			});
		}
		if(settings.length > 0) {
			next();
		}
		else {
			callback();
		}
	};

	/**
	 * Reload the user in the session from the database.
	 * @param {object} req - The request from express.
	 * @param {callback} callback - Callback which will be called (With the error as first parameter)
	 *                              after the user is refreshed.
	 * @return {undefined}
	 */
	const reloadUser = function(req, callback) {
		bot.database.getUserById(req.session.user.id, (err, user) => {
			if(!err) {
				req.session.user = user;
			}
			callback(err);
		});
	};

	return function(req, res) {
		const settings = [];
		if(req.query.record) { settings.push({ key : "record", val : req.query.record }); }
		/* ... */
		applySettings(settings, req.session.user, (err) => {
			if(err) {
				Winston.error("An error occured while saving settings for user " + req.session.user.username, err);
				res.status(HTTPCodes.internalError).send({
					okay : false,
					reason : "internal_error"
				});
			}
			else {
				reloadUser(req, (err) => {
					if(err) {
						Winston.error("Error reloading user into session.", err);
						res.status(HTTPCodes.internalError).send({
							okay : false,
							reason : "internal_error"
						});
					}
					else {
						res.status(HTTPCodes.okay).send({
							okay : true
						});
					}
				});
			}
		});
	};
};

export default ViewSettings;
