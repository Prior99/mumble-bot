import * as Winston from "winston";
/**
 * This handles the /queue endpoint giving the queue of the bot.
 * @param {object} bot - Pointer to the main bot instance.
 * @return {ViewRenderer} - Feeded view renderer for this endpoint.
 */
const ViewQueue = function(bot) {
	return function(req, res) {
		res.locals.queue = bot.output.queue;
		res.render("queue");
	};
};

export default ViewQueue;
