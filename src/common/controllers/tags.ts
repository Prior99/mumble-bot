import { context, body, controller, route, ok, created } from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";
import { verbose } from "winston";

import { Tag } from "../models";
import { createTag, world } from "../scopes";
import { Context } from "../context";

@controller @component
export class Tags {
    @inject private db: Connection;

    @route("GET", "/tags").dump(Tag, world)
    public async listTags(): Promise<Tag[]> {
        return ok(await this.db.getRepository(Tag).find());
    }

    @route("POST", "/tag").dump(Tag, world)
    public async createTag(@body(createTag) tag: Tag, @context ctx?: Context): Promise<Tag> {
        await this.db.getRepository(Tag).save(tag);
        const currentUser = await ctx.currentUser();
        verbose(`${currentUser.name} added new tag for records: "${tag.name}"`);
        return created(tag);
    }
}
