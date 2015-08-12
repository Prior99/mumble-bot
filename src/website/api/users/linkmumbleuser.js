var Winston = require('winston');

/**
 * <b>/api/users/linkMumbleUser</b> Links a mumble user to a user.
 * server this bot is connected to.
 * @param {Bot} bot - Bot the webpage belongs to.
 */
var ViewAPIUsersLinkMumbleUser = function(bot) {
	return function(req, res) {
		if(req.session.user.username == req.query.username) {
			bot.database.linkMumbleUser(req.query.id, req.query.username, function(err) {
				if(err) {
					res.status(500).send({
						okay : false,
						reason : "internal_error"
					});
				}
				else {
					Winston.log('verbose', req.session.user.username + " linked mumble user with id " + req.query.id);
					res.status(200).send({
						okay : true
					});
				}
			}.bind(this));
		}
		else {
			res.status(400).send({
				okay : false,
				reason : "invalid_user"
			});
		}
	};
};

module.exports = ViewAPIUsersLinkMumbleUser;
