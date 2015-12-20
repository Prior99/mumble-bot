import * as Winston from "winston";
import HTTPCodes from "../httpcodes";

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
	const fetchLinkedMumbleUsers = async function(records, user, username, req, res) {
		let linkedUsers;
		try {
			linkedUsers = await bot.database.getLinkedMumbleUsersOfUser(username);
		}
		catch(err) {
			Winston.error("Unabled to fetch linked mumble users of user " + username, err);
			linkedUsers = [];
		}
		renderPage(linkedUsers, records, user, username, req, res);
	}

	/**
	 * Fetches the list of records for the user and calls fetchLinkedMumbleUsers().
	 * @param {DatabaseUser} user - The fetched user associated with this username.
	 * @param {string} username - The username of the user.
	 * @param {object} req - The original request.
	 * @param {object} res - The original response object.
	 * @return {undefined}
	 */
	const fetchRecords = async function(user, username, req, res) {
		try {
			const records = await bot.database.listRecordsForUser(user);
		}
		catch(err) {
			Winston.error("Error fetching records of user " + username + ".", err);
			records = [];
		}
	}

	/**
	 * Fetches the basic information about a user and calls fetchRecords() with it.
	 * @param {string} username - The username of the user.
	 * @param {object} req - The original request.
	 * @param {object} res - The original response object.
	 * @return {undefined}
	 */
	const fetchUser = async function(username, req, res) {
		try {
			const user = await bot.database.getUserByUsername(username);
			if(user) {
				await fetchRecords(user, username, req, res);
			}
			else {
				res.status(HTTPCodes.notFound).send("Unknown user.");
			}
		}
		catch(err) {
			Winston.error("Error displaying profile of user " + username + ".", err);
			res.status(HTTPCodes.internalError).send("Internal error.");
		}
	}

	return async function(req, res) {
		const username = req.params.username;
		await fetchUser(username, req, res);
	};
};

export default ViewUsersProfile;
