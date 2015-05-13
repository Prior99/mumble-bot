function buildChannelTree(root) {
	var obj = {
		name : root.name,
		users : [],
		children : []
	};
	for(var key in root.users) {
		obj.users.push(root.users[key].name);
	}
	for(var key in root.children) {
		obj.children.push(buildChannelTree(root.children[key]))
	}
	return obj;
}

module.exports = function(bot) {
	return function(req, res) {
		res.send(JSON.stringify(buildChannelTree(bot.mumble.rootChannel)));
	}
};
