import { AuthorizedApiEndpoint } from "./types/index";
import { Bot } from "../index";
import { okay } from "./utils";

interface MumbleUser {
    name: string;
    id: number;
    session: number;
}

interface Channel {
    /**
     * List of users in the channel.
     */
    users: MumbleUser[];
    /**
     * List of child channels of this channel.
     */
    children: Channel[];
    /**
     * Name of this channel.
     */
    name: string;
}
/**
 * Generates an object representing the tree of channels and users of the mumble
 * server this bot is connected to.
 * @param root Root channel to start build the tree from.
 * @return Recursive tree of channels.
 */
const buildChannelTree = function(root: Channel): Channel {
    return {
        name: root.name,
        users: [...root.users.map(user => ({
            name: user.name,
            id: user.id,
            session: user.session
        }))],
        children: root.children.map(buildChannelTree)
    };
}

/**
 * Generates a tree with all channels and users in the mumble.
 */
export const ChannelTree: AuthorizedApiEndpoint = (bot: Bot) => (req, res) => {
    okay(res, {
        tree: buildChannelTree(bot.mumble.rootChannel)
    });
};
