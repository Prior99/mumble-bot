import * as Winston from "winston";
import HTTPCodes from "../../http-codes";

/**
 * <b>/record/labels/</b> Page for listing and creating labels.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const Labels = function(bot) {
	return async function(req, res) {
		try {
			const labels = await bot.database.listLabels();
			res.send({ labels });
		}
		catch(err) {
			Winston.error("Error listing labels", err);
			res.status(HTTPCodes.internalError).send({
				reason: "missing_arguments"
			});
		}
	}
};

export default Labels;
