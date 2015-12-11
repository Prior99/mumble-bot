/**
 * This handles the /speak endpoint.
 * @param {object} bot - Pointer to the main bot instance.
 * @return {ViewRenderer} - Feeded view renderer for this endpoint.
 */
const Speak = function(bot) {
	return function(req, res) {
		res.render("speak");
	};
};

module.exports = Speak;
