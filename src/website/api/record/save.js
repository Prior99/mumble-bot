import * as Winston from "winston";
import * as FS from "fs-promise";
import HTTPCodes from "../../httpcodes";

/**
 * View for saving a record.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewSave = function(bot) {
	return async function(req, res) {
		if(req.query.id && req.query.quote && req.query.labels) {
			const labels = JSON.parse(req.query.labels);
			const sound = bot.getCachedAudioById(req.query.id);
			const quote = req.query.quote;
			try {
				FS.mkdirSync("sounds/recorded");
			}
			catch(e) {
				if(e.code !== "EEXIST") {
					throw e;
				}
			}
			try {
				const id = await bot.database.addRecord(quote, sound.user, sound.date, labels, sound.duration);
				try {
					await FS.rename(sound.file, "sounds/recorded/" + id);
					if(bot.removeCachedAudio(sound)) {
						Winston.log("verbose", req.session.user.username + " added new record #" + id);
						res.status(HTTPCodes.okay).send({
							okay : true
						});
					}
					else {
						Winston.error("Could not remove element from array of cached audios.");
						res.status(HTTPCodes.internalError).send({
							okay : false,
							reason : "internal_error"
						});
					}
				}
				catch(err) {
					Winston.error("Could not rename new record file.", err);
					res.status(HTTPCodes.internalError).send({
						okay : false,
						reason : "internal_error"
					});
				}
			}
			catch(err) {
				Winston.error("Could not add record to database.", err);
				res.status(HTTPCodes.internalError).send({
					okay : false,
					reason : "internal_error"
				});
			}
		}
		else {
			res.status(HTTPCodes.missingArguments).send({
				okay : false,
				reason : "missing_arguments"
			});
		}
	};
};

export default ViewSave;
