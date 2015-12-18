/**
 * @typedef Channel
 * @property {string[]} users - List of users in the channel.
 * @property {Channel[]} children - List of child channels of this channel.
 * @property {string} name - Name of this channel.
 */
/**
 * Generates an object representing the tree of channels and users of the mumble
 * server this bot is connected to.
 * @param {Channel} root - Root channel to start build the tree from.
 * @return {Channel} - Recursive tree of channels.
 */
const buildChannelTree = function(root) {
	const obj = {
		name : root.name,
		users : [],
		children : []
	};
	for(const user of root.users) {
		obj.users.push(user.name);
	}
	for(const channel of root.children) {
		obj.children.push(buildChannelTree(channel))
	}
	return obj;
}

/**
 * <b>/api/tree/</b> Generates a tree with all channels and users in the mumble
 * server this bot is connected to.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewAPIChannelTree = function(bot) {
	return function(req, res) {
		res.send(JSON.stringify(buildChannelTree(bot.mumble.rootChannel)));
	}
};

export default ViewAPIChannelTree;
