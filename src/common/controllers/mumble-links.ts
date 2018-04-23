import { context, body, controller, route, param, is, uuid, ok, notFound, created, DataType } from "hyrest";
import { component, inject } from "tsdi";
import { Connection, Transaction, EntityManager, TransactionManager } from "typeorm";
import { verbose } from "winston";

import { MumbleLink, MumbleUser } from "../models";
import { createMumbleLink, world } from "../scopes";
import { Context } from "../context";
import { Setting } from "../models/setting";

export interface Settings {
    [key: string]: string;
}

@controller @component
export class MumbleLinks {
    @inject private db: Connection;

    @route("POST", "/mumble-link").dump(MumbleLink, world)
    public async createMumbleLink(
        @body(createMumbleLink) @is() mumbleLink: MumbleLink
    ): Promise<MumbleLink> {
        await this.db.getRepository(MumbleLink).save(mumbleLink);
        return created(mumbleLink);
    }

    @route("GET", "/mumble-links").dump(MumbleUser, world)
    public async getMumbleLinks(): Promise<MumbleLink[]> {
        return ok(await this.db.getRepository(MumbleLink).find());
    }
}
