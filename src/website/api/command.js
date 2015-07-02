module.exports = function(bot) {

	function runCommand(command) {
		bot.command.process(command);
	}

	return function(req, res) {
		if(req.query.command) {
			runCommand(req.query.command);
		}
		else {
			res.send(JSON.stringify({
				okay : false,
				reason: "missing_arguments"
			}));
		}
	}
};
