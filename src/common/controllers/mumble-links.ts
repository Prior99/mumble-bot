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
import { verbose } from "winston";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";
import { Connection as MumbleConnection } from "mumble";
import { MumbleLink } from "../models";
import { createMumbleLink, world } from "../scopes";
import { Context } from "../context";
import { AudioInput } from "../../server/audio-input/index";

export interface Settings {
    [key: string]: string;
}

@controller @component
export class MumbleLinks {
    @inject private db: Connection;
    @inject private mumble: MumbleConnection;
    @inject private audioInput: AudioInput;

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
        const currentUser = await ctx.currentUser();
        if (mumbleLink.user.id !== currentUser.id) {
            return forbidden<MumbleLink>("Can't link a mumble user to a foreign user.");
        }
        const mumbleUser = this.mumble.userById(mumbleLink.mumbleId);
        if (!mumbleUser) {
            return badRequest<MumbleLink>("Unknown mumble user.");
        }
        verbose(`Linked user ${currentUser.id} to mumble user "${mumbleUser.name}" with id ${mumbleUser.id}`);
        await this.db.getRepository(MumbleLink).save(mumbleLink);
        await this.audioInput.addRegisteredUser(mumbleUser, currentUser);
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
