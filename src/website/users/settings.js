import * as Winston from "winston";
import * as HTTPCodes from "../httpcodes";

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
	const getMumbleUsersLinkingPossible = function(mumbleUsers, cb) {
		const arr = [];
		bot.database.getLinkedMumbleUsers((err, mumbleIds) => {
			if(err) {
				Winston.error("Error fetching registered mumble users", err);
				cb([]);
			}
			else {
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
				cb(arr);
			}
		});
	}

	return function(req, res) {
		const user = req.session.user;
		bot.database.getUserByUsername(user.username, (err, user) => { //Reload user from database
			if(err) {
				Winston.error("Error displaying profile of user " + username + ".", err);
				res.status(HTTPCodes.internalError).send("Internal error.");
			}
			else {
				if(user) {
					getMumbleUsersLinkingPossible(bot.getRegisteredMumbleUsers(), (mumbleUsers) => {
						bot.database.getLinkedMumbleUsersOfUser(user.username, (err, linkedUsers) => {
							if(err) {
								Winston.error("Unabled to fetch linked mumble users of user " + user.username, err);
								linkedUsers = [];
							}
							res.locals.user = user;
							res.locals.linkedUsers = linkedUsers.map((user) => bot.mumble.userById(user.id));
							res.locals.freeMumbleUsers = mumbleUsers;
							res.render("users/settings");
						});
					});
				}
				else {
					res.status(HTTPCodes.notFound).send("Unknown user.");
				}
			}
		});
	};
};

export default ViewSettings;
