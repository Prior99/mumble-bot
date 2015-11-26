var Winston = require('winston');
var reply = require("../util.js").reply;
var Promise = require("promise");

module.exports = function(bot) {
	return function(req, res) {

		function internalErr(msg)	{
			return function(err) {
				Winston.error(msg, err);
				reply(res, 500, false, { reason : "internal_error" });
			}
		}

		function playDialog(ids) {
			var files = ids.map(function(id) {
				return "sounds/recorded/" + id;
			});
			bot.output.playSounds(files);
			reply(res, 200, true, {});
		}

		function loadDialog() {
			Winston.log('verbose', req.session.user.username + " played back dialog #" + req.query.id);
			var cannotLoad = internalErr("Could not load dialog parts");
			Promise.denodeify(bot.database.getDialogParts.bind(bot.database))(req.query.id)
			.catch(cannotLoad)
			.then(playDialog);
		}

		if(req.query.id) {
			var cannotUse = internalErr("Could not increment usage of dialog");
			Promise.denodeify(bot.database.usedDialog.bind(bot.database))(req.query.id)
			.catch(cannotUse)
			.then(loadDialog);
		}
		else {
			reply(res, 499, false, { reason : "missing_arguments" });
		}
	};
};
