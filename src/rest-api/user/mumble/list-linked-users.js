import * as Winston from "winston";
import HTTPCodes from "../httpcodes";

const LinkedUsers = function(bot) {
	return async function(req, res) {
		try {
			const user = await bot.database.getUserByUsername(req.body.user.username); //Reload user from database
			if(user) {
				try {
					const linkedUsers = await bot.database.getLinkedMumbleUsersOfUser(user.username);
					const users = linkedUsers.map(user => bot.mumble.userById(user.id));
					res.send({
						users
					});
				}
				catch(err) {
					Winston.error(`Unabled to fetch linked mumble users of user ${user.username, err}`);
					res.status(HTTPCodes.internalError).send({
						reason: "internal_error"
					});
				}
			}
			else {
				res.status(HTTPCodes.notFound).send({
					reason: "invalid_argument"
				});
			}
		}
		catch(err) {
			Winston.error(`Error fetching user ${user.id}.`, err);
			res.status(HTTPCodes.internalError).send({
				reason: "internal_error"
			});
		}
	};
};

export default LinkedUsers;
