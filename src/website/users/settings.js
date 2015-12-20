import * as Winston from "winston";
import HTTPCodes from "../httpcodes";

/**
 * This handles the /users/settings endpoint handling all the stuff for linking
 * mumble users and the possible settings.
 * @param {object} bot - Pointer to the main bot instance.
 * @return {ViewRenderer} - Feeded view renderer for this endpoint.
 */
const ViewSettings = function(bot) {
	/**
	 * Get a list of users to which linking is still possible as they are not yet linked.
	 * @param {MumbleUser[]} mumbleUsers - List of all connected users.
	 * @param {callback} cb - Called when the request was finished. First parameter is a list of all users
	 *                        to which linking is still possible.
	 * @return {undefined}
	 */
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
		let user = req.session.user;
		try {
			user = await bot.database.getUserByUsername(user.username); //Reload user from database
			if(user) {
				const mumbleUsers = await getMumbleUsersLinkingPossible(bot.getRegisteredMumbleUsers());
				try {
					const linkedUsers = await bot.database.getLinkedMumbleUsersOfUser(user.username);
					res.locals.user = user;
					res.locals.linkedUsers = linkedUsers.map((user) => bot.mumble.userById(user.id));
					res.locals.freeMumbleUsers = mumbleUsers;
					res.render("users/settings");
				}
				catch(err) {
					Winston.error("Unabled to fetch linked mumble users of user " + user.username, err);
					linkedUsers = [];
				}
			}
			else {
				res.status(HTTPCodes.notFound).send("Unknown user.");
			}
		}
		catch(err) {
			Winston.error("Error displaying profile of user " + username + ".", err);
			res.status(HTTPCodes.internalError).send("Internal error.");
		}
	};
};

export default ViewSettings;
