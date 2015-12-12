import * as Winston from "winston";
import * as HTTPCodes from "../../httpcodes";

/**
 * Handles adding new quotes to the database.
 * @param {string} author - The author of the quote.
 * @param {string} quote - The quote itself.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @param {object} res - The response object from express to answer.
 * @param {object} req - The original request object from express.
 * @return {undefined}
 */
const enterQuote = function(author, quote, bot, res, req) {
	bot.database.addQuote(quote, author, (err, id) => {
		if(err) {
			Winston.error("Error occured when entering quote into database: " + err);
			res.status(HTTPCodes.internalError).send(JSON.stringify({
				okay : false,
				reason : "internal_error"
			}));
		}
		else {
			Winston.log("verbose", req.session.user.username + " added new quote #" + id);
			res.send(JSON.stringify({
				okay : true,
				id
			}));
		}
	});
}

/**
 * This view handles adding of new quotes to the database.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewAdd = function(bot) {
	return function(req, res) {
		if(req.query.author && req.query.quote) {
			bot.permissions.hasPermission(req.session.user, "add-quote", (has) => {
				if(has) {
					enterQuote(req.query.author, req.query.quote, bot, res, req);
				}
				else {
					res.status(HTTPCodes.insufficientPermission).send(JSON.stringify({
						okay : false,
						reason: "insufficient_permission"
					}));
				}
			});
		}
		else {
			res.send(JSON.stringify({
				okay : false,
				reason: "missing_arguments"
			}));
		}
	}
};

export default ViewAdd;
