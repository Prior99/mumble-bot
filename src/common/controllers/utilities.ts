import { body, controller, route, param, is, uuid, ok } from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";
import { bind } from "bind-decorator";
import { Connection as MumbleConnection} from "mumble";

import { Channel, LogEntry, MumbleUser } from "../models";
import { world } from "../scopes";
import { Bot } from "../../server";

@controller @component
export class Utilities {
    @inject private db: Connection;
    @inject private mumble: MumbleConnection;
    @inject private bot: Bot;

    @bind private buildChannelTree(channel: Channel) {
        const { name, position } = channel;
        const users = channel.users.map(user => ({
            name: user.name,
            id: user.id,
            session: user.session
        }));
        const children = channel.children
            .sort((a, b) => a.position - b.position)
            .map(this.buildChannelTree);
        return { name, position, users, children };
    }

    @route("GET", "/channel-tree")
    public async channelTree(): Promise<Channel> {
        return ok(this.buildChannelTree(this.mumble.rootChannel));
    }

    @route("POST", "/shut-up")
    public async shutUp(): Promise<{}> {
        this.bot.beQuiet();
        return ok();
    }

    @route("GET", "/log").dump(LogEntry, world)
    public async getLog(): Promise<LogEntry[]> {
        const entries = await this.db.getRepository(LogEntry).createQueryBuilder("entry")
            .limit(300)
            .orderBy("entry.timestamp", "DESC")
            .getMany();
        return ok(entries);
    }

    @route("GET", "/mumble-users").dump(MumbleUser, world)
    public async getMumbleUsers(): Promise<MumbleUser[]> {
        const mumbleUsers = await this.bot.getRegisteredMumbleUsers();
        return ok(mumbleUsers.map(user => {
            const { name, id, session } = user;
            return { name, id, session };
        }));
    }
}
