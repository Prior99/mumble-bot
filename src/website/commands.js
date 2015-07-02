function fetchCommands(bot) {
	var cmds = [];
	var commands = bot.command.commands;
	for(var i in commands) {
		cmds.push(i);
	}
	return cmds;
}

module.exports = function(bot) {
	return function(req, res) {
		var commands = fetchCommands(bot);
		console.log(commands);
		res.locals.commands = commands;
		res.render("commands");
	}
};
