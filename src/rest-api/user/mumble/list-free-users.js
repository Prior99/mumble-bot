import * as Winston from "winston";
import HTTPCodes from "../../http-codes";

async function getMumbleUsersLinkingPossible(bot) {
	const mumbleUsers = bot.getRegisteredMumbleUsers();
	try {
		const arr = [];
		const mumbleIds = await bot.database.getLinkedMumbleUsers();
		return mumbleUsers.reduce((result, user) => {
			const linked = mumbleIds.reduce((linkedId, id) => id.id === user.id || linkedId, false);
			if (!linked && user.id !== bot.mumble.user.id) {
				return [...result, user];
			}
			return result;
		}, []);
	}
	catch(err) {
		Winston.error("Error fetching registered mumble users", err);
		return [];
	}
}

const FreeMumbleUsers = function(bot) {

	return async function(req, res) {
		try {
			const users = await getMumbleUsersLinkingPossible(bot);
			res.send({
				okay: true,
				users
			});
		}
		catch(err) {
			Winston.error("Error fetching unlinked users.", err);
			res.status(HTTPCodes.internalError).send({
				okay: false,
				reason: "internal_error"
			});
		}
	};
};

export default FreeMumbleUsers;
