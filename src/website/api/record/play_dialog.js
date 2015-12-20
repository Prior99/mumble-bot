import * as Winston from "winston";
import reply from "../util.js";
import HTTPCodes from "../../httpcodes";

/**
 * This view plays back saved dialogs.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewPlayDialog = function(bot) {
	return async function(req, res) {
		/**
		 * Handles an internal Error.
		 * @param {string} msg - Message for the error.
		 * @return {callback} - Call this function with the error as first
		 *                      parameter in order to log and replay with an internal error.
		 */
		const internalErr = function(msg)	{
			return function(err) {
				Winston.error(msg, err);
				reply(res, HTTPCodes.internalError, false, { reason : "internal_error" });
			}
		}

		/**
		 * Playback the dialog and respond with okay.
		 * @param {number[]} ids - List of ids to play back in the given order.
		 * @return {undefined}
		 */
		const playDialog = function(ids) {
			const files = ids.map((id) => "sounds/recorded/" + id);
			bot.output.playSounds(files);
			reply(res, HTTPCodes.okay, true, {});
		}

		/**
		 * <b>Async</b> Load the dialog from the given id and play it back.
		 * @return {undefined}
		 */
		const loadDialog = async function() {
			Winston.log("verbose", req.session.user.username + " played back dialog #" + req.query.id);
			const cannotLoad = internalErr("Could not load dialog parts");
			try {
				const parts = await bot.database.getDialogParts(req.query.id);
				playDialog(parts);
			}
			catch(err) {
				cannotLoad(err);
			}
		}

		if(req.query.id) {
			const cannotUse = internalErr("Could not increment usage of dialog");
			try {
				await bot.database.usedDialog(req.query.id);
				loadDialog();
			}
			catch(err) {
				cannotUse(err);
			}
		}
		else {
			reply(res, HTTPCodes.missingArguments, false, { reason : "missing_arguments" });
		}
	};
};

export default ViewPlayDialog;
