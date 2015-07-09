/**
 * <b>/api/command/</b> Runs a specified command on the bot.
 * @param {Bot} bot - Bot the webpage belongs to.
 */
var ViewAPIRunCommand = function(bot) {
	return function(req, res) {

		function runCommand(command, argument) {
			bot.command.process(command + " " + argument, 'website', req.session.user);
		}

		if(req.query.command) {
			runCommand(req.query.command, req.query.argument);
			res.status(200).send(JSON.stringify({
				okay : true
			}));
		}
		else {
			res.status(400).send(JSON.stringify({
				okay : false,
				reason: "missing_arguments"
			}));
		}
	}
};

module.exports = ViewAPIRunCommand;
