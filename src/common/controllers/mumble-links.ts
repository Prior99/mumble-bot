import {
    context,
    body,
    controller,
    route,
    is,
    ok,
    created,
    forbidden,
    badRequest,
} from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";
import { Connection as MumbleConnection } from "mumble";
import { MumbleLink } from "../models";
import { createMumbleLink, world } from "../scopes";
import { Context } from "../context";

export interface Settings {
    [key: string]: string;
}

@controller @component
export class MumbleLinks {
    @inject private db: Connection;
    @inject private mumble: MumbleConnection;

    /**
     * Create a new linkage between a database user and a user in the mumble server.
     *
     * @param mumbleLink The the `mumbleId` and `user.id` properties of `MumbleLink`.
     *
     * @return The created `MumbleLink`.
     */
    @route("POST", "/mumble-link").dump(MumbleLink, world)
    public async createMumbleLink(
        @body(createMumbleLink) @is() mumbleLink: MumbleLink,
        @context ctx?: Context,
    ): Promise<MumbleLink> {
        if (mumbleLink.user.id !== (await ctx.currentUser()).id) {
            return forbidden<MumbleLink>("Can't link a mumble user to a foreign user.");
        }
        const mumbleUser = this.mumble.userById(mumbleLink.mumbleId);
        if (!mumbleUser) {
            return badRequest<MumbleLink>("Unknown mumble user.");
        }
        mumbleLink.name = mumbleUser.name;
        await this.db.getRepository(MumbleLink).save(mumbleLink);
        return created(mumbleLink);
    }

    /**
     * Returns the list of all mumble links in the database.
     *
     * @return All `MumbleLink`s.
     */
    @route("GET", "/mumble-links").dump(MumbleLink, world)
    public async getMumbleLinks(): Promise<MumbleLink[]> {
        return ok(await this.db.getRepository(MumbleLink).find({ relations: ["user"] }));
    }
}
