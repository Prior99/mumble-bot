import { body, controller, route, param, is, uuid, ok } from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";

import { Channel } from "../models";

@controller @component
export class Users {
    @inject private db: Connection;

    @route("GET", "/channel-tree")
    public async channelTree(): Promise<Channel> {
        return ok();
    }

    @route("POST", "/shut-up")
    public async shutUp(): Promise<{}> {
        return ok();
    }
}
