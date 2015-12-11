import * as Winston from "winston";
import * as HTTPCodes from "../httpcodes";

/**
 * <b>/users/profile/:username</b> Display the profile of a specific user.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - The generated view render for this endpoint.
 */
const ViewUsersProfile = function(bot) {
	/**
	 * Renders the page with all the given information.
	 * @param {object} linkedUsers - List of linked mumble users.
	 * @param {Record[]} records - The list of records of this user.
	 * @param {DatabaseUser} user - The fetched user associated with this username.
	 * @param {string} username - The username of the user.
	 * @param {object} req - The original request.
	 * @param {object} res - The original response object.
	 * @return {undefined}
	 */
	const renderPage = function(linkedUsers, records, user, username, req, res) {
		res.locals.user = user;

		res.locals.linkedUsers = linkedUsers.map((user) => bot.mumble.userById(user.id));
		res.locals.own = req.session.user.id === user.id;
		res.locals.records = records;
		res.render("users/profile");
	}

	/**
	 * Fetches the linked mumble user and calls renderPage()
	 * @param {Record[]} records - The list of records of this user.
	 * @param {DatabaseUser} user - The fetched user associated with this username.
	 * @param {string} username - The username of the user.
	 * @param {object} req - The original request.
	 * @param {object} res - The original response object.
	 * @return {undefined}
	 */
	const fetchLinkedMumbleUsers = function(records, user, username, req, res) {
		bot.database.getLinkedMumbleUsersOfUser(username, (err, linkedUsers) => {
			if(err) {
				Winston.error("Unabled to fetch linked mumble users of user " + username, err);
				linkedUsers = [];
			}
			renderPage(linkedUsers, records, user, username, req, res);
		});
	}

	/**
	 * Fetches the list of records for the user and calls fetchLinkedMumbleUsers().
	 * @param {DatabaseUser} user - The fetched user associated with this username.
	 * @param {string} username - The username of the user.
	 * @param {object} req - The original request.
	 * @param {object} res - The original response object.
	 * @return {undefined}
	 */
	const fetchRecords = function(user, username, req, res) {
		bot.database.listRecordsForUser(user, (err, records) => {
			if(err) {
				Winston.error("Error fetching records of user " + username + ".", err);
				records = [];
			}
			fetchLinkedMumbleUsers(records, user, username, req, res);
		});
	}

	/**
	 * Fetches the basic information about a user and calls fetchRecords() with it.
	 * @param {string} username - The username of the user.
	 * @param {object} req - The original request.
	 * @param {object} res - The original response object.
	 * @return {undefined}
	 */
	const fetchUser = function(username, req, res) {
		bot.database.getUserByUsername(username, (err, user) => {
			if(err) {
				Winston.error("Error displaying profile of user " + username + ".", err);
				res.status(HTTPCodes.internalError).send("Internal error.");
			}
			else {
				if(user) {
					fetchRecords(user, username, req, res);
				}
				else {
					res.status(HTTPCodes.notFound).send("Unknown user.");
				}
			}
		});
	}

	return function(req, res) {
		const username = req.params.username;
		fetchUser(username, req, res);
	};
};

export default ViewUsersProfile;
