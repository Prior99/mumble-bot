import * as Winston from "winston";

/**
 * Log a user out.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewLogout = function() {
	return function(req, res) {
		if(req.session.user) {
			Winston.log("verbose", req.session.user.username + " logged off.");
			req.session.destroy(() => {
				res.send({
					okay : true
				});
			});
		}
		else {
			res.send({
				okay : false,
				reason : "not_logged_in"
			});
		}
	}
};

export default ViewLogout;
