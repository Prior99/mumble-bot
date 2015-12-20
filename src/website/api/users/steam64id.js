import * as Steam64 from "../../../steam64id.js";
import HTTPCodes from "../../httpcodes";

/**
 * Looks up a steam 64 id on the steam api and proxies it to our api.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewSteam64Id = function() {
	return function(req, res) {
		Steam64(req.query.steamusername, (err, steam64id) => {
			if(err) {
				res.status(HTTPCodes.internalError).send(JSON.stringify({
					okay : false
				}));
			}
			else {
				if(!steam64id) {
					res.status(HTTPCodes.invalidRequest).send(JSON.stringify({
						okay : true,
						exists : false
					}));
				}
				else {
					res.status(HTTPCodes.okay).send(JSON.stringify({
						okay : true,
						exists : true,
						id : steam64id
					}));
				}
			}
		});
	}
};

export default ViewSteam64Id;
