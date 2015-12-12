import * as Winston from "winston";

/**
 * <b>/record/stored/</b> Displays the page for all stored records.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewStored = function(bot) {
	return function(req, res) {
		res.render("record/stored");
	}
};

export default ViewStored;
