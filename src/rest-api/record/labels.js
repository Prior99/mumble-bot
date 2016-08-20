import * as Winston from "winston";
import HTTPCodes from "../../httpcodes";

/**
 * <b>/record/labels/</b> Page for listing and creating labels.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewLabels = function(bot) {
	return async function(req, res) {
		try {
			const labels = await bot.database.listLabels();
			res.send({
				okay: true,
				labels
			});
		}
		catch(err) {
			Winston.error("Error listing labels", err);
			res.status(HTTPCodes.internalError).send({
				okay: false,
				reason: "missing_arguments"
			});
		}
	}
};

export default ViewLabels;
