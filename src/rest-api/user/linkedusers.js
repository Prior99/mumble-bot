import * as Winston from "winston";
import HTTPCodes from "../httpcodes";

const ViewLinkedUsers = function(bot) {
	return async function(req, res) {
		try {
			user = await bot.database.getUserByUsername(user.username); //Reload user from database
			if(user) {
				const mumbleUsers = await getMumbleUsersLinkingPossible(bot.getRegisteredMumbleUsers());
				try {
					const linkedUsers = await bot.database.getLinkedMumbleUsersOfUser(user.username);
					const users = linkedUsers.map((user) => bot.mumble.userById(user.id));
					res.send({
						okay: true,
						users
					});
				}
				catch(err) {
					Winston.error("Unabled to fetch linked mumble users of user " + user.username, err);
					res.status(HTTPCodes.internalError).send({
						okay: false,
						reason: "internal_error"
					});
				}
			}
			else {
				res.status(HTTPCodes.notFound).send({
					okay: false,
					reason: "invalid_argument"
				});
			}
		}
		catch(err) {
			Winston.error("Error fetching user " + user.id + ".", err);
			res.status(HTTPCodes.internalError).send({
				okay: false,
				reason: "internal_error"
			});
		}
	};
};

export default ViewLinkedUsers;
