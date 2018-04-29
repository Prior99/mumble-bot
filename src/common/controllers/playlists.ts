import { context, body, controller, route, param, is, uuid, ok, created } from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";
import { verbose } from "winston";

import { AudioOutput } from "../../server";
import { ServerConfig } from "../../config";
import { Playlist } from "../models";
import { createPlaylist, world } from "../scopes";
import { Context } from "../context";

@controller @component
export class Playlists {
    @inject private db: Connection;
    @inject private audioOutput: AudioOutput;
    @inject private config: ServerConfig;

    @route("GET", "/playlists").dump(Playlist, world)
    public async listPlaylists(@param("id") @is().validate(uuid) id: string): Promise<Playlist[]> {
        const playlists = await this.db.getRepository(Playlist).find();
        return ok(playlists);
    }

    @route("POST", "/playlist/:id/play")
    public async playPlaylist(@param("id") @is().validate(uuid) id: string, @context ctx?: Context): Promise<{}> {
        const playlist = await this.db.getRepository(Playlist).findOne(id, {
            relations: ["parts", "parts.sound"],
        });
        playlist.used++;
        await this.db.getRepository(Playlist).save(playlist);

        const currentUser = await ctx.currentUser();

        const files = playlist.parts.map(part => `${this.config.soundsDir}/${part.sound.id}`);
        this.audioOutput.playSounds(files, {
            type: "playlist",
            user: currentUser,
        });

        verbose(`${currentUser.name} played playlist ${id}`);

        return ok();
    }

    @route("POST", "/playlist").dump(Playlist, world)
    public async createPlaylist(@body(createPlaylist) playlist: Playlist, @context ctx?: Context): Promise<Playlist> {
        await this.db.getRepository(Playlist).save(playlist);

        const { name } = await ctx.currentUser();
        verbose(`${name} created a new playlist ${playlist.id}`);

        return created(playlist);
    }
}
