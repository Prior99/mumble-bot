import * as Winston from "winston";
import HTTPCodes from "../../httpcodes";

const ViewPlay = function(bot) {
	return async function(req, res) {
		const url = req.query.url;
		if(bot.spotify) {
			const file = await bot.spotify.getCachedMP3ByURL(url);
			bot.play(file);
		}
	};
};

export default ViewPlay;
