/**
 * <b>/api/command/</b> Runs a specified command on the bot.
 * @param {Bot} bot - Bot the webpage belongs to.
 */
var ViewAPIRunCommand = function(bot) {

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

module.exports = ViewAPIRunCommand;
