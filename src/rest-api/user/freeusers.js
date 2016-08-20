import * as Winston from "winston";
import HTTPCodes from "../httpcodes";

const ViewFreeMumbleUsers = function(bot) {
	const getMumbleUsersLinkingPossible = async function(mumbleUsers, cb) {
		try {
			const arr = [];
			const mumbleIds = await bot.database.getLinkedMumbleUsers();
			for(const u of mumbleUsers) {
				let linked = false;
				for(const j of mumbleIds) {
					if(j.id === u.id) {
						linked = true;
						break;
					}
				}
				if(!linked && u.id !== bot.mumble.user.id) {
					arr.push(u);
				}
			}
			return arr;
		}
		catch(err) {
			Winston.error("Error fetching registered mumble users", err);
			return [];
		}
	}

	return async function(req, res) {
		try {
			const users = await getMumbleUsersLinkingPossible(bot.getRegisteredMumbleUsers());
			res.send({
				okay: true,
				users
			})
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

export default ViewFreeMumbleUsers;
