import { context, body, controller, route, param, is, uuid, ok, created } from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";
import { verbose } from "winston";
import { Playlist } from "../models";
import { createPlaylist, world } from "../scopes";
import { Context } from "../context";

@controller @component
export class Playlists {
    @inject private db: Connection;

    @route("GET", "/playlists").dump(Playlist, world)
    public async listPlaylists(): Promise<Playlist[]> {
        const playlists = await this.db.getRepository(Playlist).find();
        return ok(playlists);
    }

    @route("POST", "/playlist").dump(Playlist, world)
    public async createPlaylist(@body(createPlaylist) playlist: Playlist, @context ctx?: Context): Promise<Playlist> {
        await this.db.getRepository(Playlist).save(playlist);

        const { name } = await ctx.currentUser();
        verbose(`${name} created a new playlist ${playlist.id}`);

        return created(playlist);
    }
}
