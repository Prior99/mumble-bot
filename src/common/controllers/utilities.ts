import { body, controller, route, param, is, uuid, ok } from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";
import { bind } from "bind-decorator";
import { Connection as MumbleConnection} from "mumble";

import { Channel, MumbleUser } from "../models";
import { world } from "../scopes";
import { AudioOutput } from "../../server";

@controller @component
export class Utilities {
    @inject private db: Connection;
    @inject private mumble: MumbleConnection;
    @inject private audioOutput: AudioOutput;

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
        this.audioOutput.clear();
        return ok();
    }

    @route("GET", "/mumble-users").dump(MumbleUser, world)
    public async getMumbleUsers(): Promise<MumbleUser[]> {
        const mumbleUsers = this.mumble.users().filter(user => typeof user.id !== "undefined");
        return ok(mumbleUsers.map(user => {
            const { name, id, session } = user;
            return { name, id, session };
        }));
    }
}
