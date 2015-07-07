/**
 * Generates an object representing the tree of channels and users of the mumble
 * server this bot is connected to.
 * @param root - Root channel to start build the tree from.
 */
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

/**
 * <b>/api/tree/</b> Generates a tree with all channels and users in the mumble
 * server this bot is connected to.
 * @param {Bot} bot - Bot the webpage belongs to.
 */
var ViewAPIChannelTree = function(bot) {
	return function(req, res) {
		res.send(JSON.stringify(buildChannelTree(bot.mumble.rootChannel)));
	}
};

module.exports = ViewAPIChannelTree;
