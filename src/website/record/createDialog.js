import * as Winston from "winston";

/**
 * <b>/record/create_dialog/</b> Page for creating new dialogs.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewCreateDialogs = function(bot) {
	return function(req, res) {
		res.render("record/create_dialog");
	};
};

export default ViewCreateDialogs;
