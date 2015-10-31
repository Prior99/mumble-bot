var Winston = require('winston');

module.exports = function(bot) {
	return function(req, res) {
		
		function internalErr(msg)	{
			return function(err) {
				Winston.error(msg, err);
				reply(res, 500, false, { reason : "internal_error" });
			}
		}
		
		function playDialog(err, ids) {
			var files = ids.map(function(id) {
				return "sounds/recorded/" + id.recordId;
			});
			bot.output.playSounds(files);
			reply(res, 200, true, {});
		}
		
		function loadDialog(err) {
			Winston.log('verbose', req.session.user.username + " played back dialog #" + req.query.id);
			var cannotLoad = internalErr("Could not load dialog parts");
			bot.database.getDialogParts(req.query.id, cannotLoad, playDialog);
		}
	
		if(req.query.id) {
			var cannotUse = internalErr("Could not increment usage of dialog");
			bot.database.usedDialog(req.query.id, cannotUse, loadDialog);
		}
		else {
			reply(res, 499, false, { reason : "missing_arguments" });
		}
	};
};
