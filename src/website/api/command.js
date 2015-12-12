import * as HTTPCodes from "../httpcodes";

/**
 * <b>/api/command/</b> Runs a specified command on the bot.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewAPIRunCommand = function(bot) {
	return function(req, res) {
		/**
		 * Run a command with the given arguments.
		 * @param {string} command - The command to run.
		 * @param {string} argument - An argument for the command.
		 * @return {undefined}
		 */
		const runCommand = function(command, argument) {
			let string = command;
			if(argument) {
				string += " " + argument;
			}
			bot.command.process(string, "website", req.session.user);
		}

		if(req.query.command) {
			runCommand(req.query.command, req.query.argument);
			res.status(HTTPCodes.okay).send(JSON.stringify({
				okay : true
			}));
		}
		else {
			res.status(HTTPCodes.invalidRequest).send(JSON.stringify({
				okay : false,
				reason: "missing_arguments"
			}));
		}
	}
};

export default ViewAPIRunCommand;
