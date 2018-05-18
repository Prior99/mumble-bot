import { notFound, context, body, controller, route, ok, created, param, uuid, is } from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";
import { verbose } from "winston";
import { Playlist, PlaylistEntry } from "../models";
import { createPlaylist, listPlaylists, updatePlaylist } from "../scopes";
import { Context } from "../context";
import { world } from "../";

@controller @component
export class Playlists {
    @inject private db: Connection;

    @route("GET", "/playlists").dump(Playlist, listPlaylists)
    public async listPlaylists(): Promise<Playlist[]> {
        const playlists = await this.db.getRepository(Playlist).createQueryBuilder("playlist")
            .leftJoinAndSelect("playlist.creator", "creator")
            .leftJoinAndSelect("playlist.entries", "entry")
            .leftJoinAndSelect("entry.sound", "sound")
            .orderBy("playlist.created", "DESC")
            .addOrderBy("entry.position", "ASC")
            .getMany();
        return ok(playlists);
    }

    @route("GET", "/playlist/:id").dump(Playlist, listPlaylists)
    public async getPlaylist(@param("id") @is().validate(uuid) id: string): Promise<Playlist> {
        const playlist = await this.db.getRepository(Playlist).createQueryBuilder("playlist")
            .where("playlist.id = :id", { id })
            .leftJoinAndSelect("playlist.creator", "creator")
            .leftJoinAndSelect("playlist.entries", "entry")
            .leftJoinAndSelect("entry.sound", "sound")
            .orderBy("playlist.created", "DESC")
            .addOrderBy("entry.position", "ASC")
            .getOne();
        if (!playlist) { return notFound<Playlist>(`No playlist with id ${id}`); }
        return ok(playlist);
    }

    @route("POST", "/playlists").dump(Playlist, listPlaylists)
    public async createPlaylist(@body(createPlaylist) data: Playlist, @context ctx?: Context): Promise<Playlist> {
        const { name, id: creatorId } = await ctx.currentUser();
        const playlist = await this.db.getRepository(Playlist).save({
            ...data,
            creator: { id: creatorId },
        });
        await this.db.getRepository(PlaylistEntry).save(data.entries.map(entry => ({ ...entry, playlist })));
        verbose(`${name} created a new playlist ${playlist.id}`);
        return created(await this.getPlaylist(playlist.id));
    }

    @route("POST", "/playlist/:id").dump(Playlist, world)
    public async updatePlaylist(
        @param("id") @is().validate(uuid) id: string,
        @body(updatePlaylist) playlist: Playlist,
        @context ctx?: Context,
    ): Promise<Playlist>{
        if (!await this.db.getRepository(Playlist).findOne(id)) {
            return notFound<Playlist>(`No playlist with id "${id}"`);
        }
        await this.db.getRepository(Playlist).update(id, playlist);

        const { name } = await ctx.currentUser();
        verbose(`${name} edited playlist #${id}`);

        const updated = await this.getPlaylist(id);
        return ok(updated);
    }
}
