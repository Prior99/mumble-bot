import { context, body, controller, route, param, is, uuid, ok, created } from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";
import { verbose } from "winston";

import { Label } from "../models";
import { createLabel, world } from "../scopes";
import { Context } from "../context";

@controller @component
export class Labels {
    @inject private db: Connection;

    @route("GET", "/labels").dump(Label, world)
    public async listLabels(): Promise<Label[]> {
        return ok(await this.db.getRepository(Label).find());
    }

    @route("POST", "/labels").dump(Label, world)
    public async createLabel(@body(createLabel) label: Label, @context ctx?: Context): Promise<Label> {
        await this.db.getRepository(Label).save(label);
        const currentUser = await ctx.currentUser();
        verbose(`${currentUser.username} added new label for records: "${label.name}"`);
        return created(label);
    }
}
