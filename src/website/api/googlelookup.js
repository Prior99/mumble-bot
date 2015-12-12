import * as Winston from "winston";
import * as Request from "request";
import * as HTTPCodes from "../httpcodes";
/**
 * <b>/api/google/</b> Looks up something on the google autocomplete api.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const Google = function(bot) {
	return function(req, res) {
		if(req.query.string) {
			Request.get({
				url  :"https://www.google.de/s?sclient=psy-ab&oe=utf-8&ie=UTF-8&q=" + req.query.string,
				encoding  : "utf8"
			}, (err, f, body) => {
				if(err || f.statusCode !== HTTPCodes.okay) {
					Winston.error("Error when fetching google lookup. Error:", err, "status code was", f.statusCode);
					res.status(HTTPCodes.internalError).send({
						okay : false,
						reason: "internal_error"
					});
				}
				else {
					const result = [];
					body = JSON.parse(body);
					for(const arr of body[1]) {
						const s = decodeURIComponent(arr[0]).replace(/<\/?b>/g, "");
						bot.say(s);
						result.push(s);
					}
					res.status(HTTPCodes.okay).send({
						okay : true,
						results : result
					});
				}
			});
		}
		else {
			res.status(HTTPCodes.invalidRequest).send({
				okay : false,
				reason: "missing_arguments"
			});
		}
	};
};

export default Google;
