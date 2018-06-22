import {
    query,
    DataType,
    oneOf,
    notFound,
    context,
    body,
    controller,
    route,
    ok,
    created,
    param,
    uuid,
    is,
    populate,
} from "hyrest";
import { component, inject } from "tsdi";
import { Connection, Brackets } from "typeorm";
import { verbose } from "winston";
import { Playlist, PlaylistEntry, PlaylistsQueryResult } from "../models";
import { createPlaylist, listPlaylists, updatePlaylist } from "../scopes";
import { Context } from "../context";
import { world } from "../";
import { ServerConfig } from "../../config";

export interface PlaylistsQuery {
    /**
     * A string to search in the description of a playlist for.
     */
    search?: string;
    /**
     * Limit the amount of returned playlists to this amount.
     */
    limit?: number;
    /**
     * Offset for the pagination by absolute amount of playlists.
     */
    offset?: number;
    /**
     * Limit the returned playlists to playlists created by this user.
     */
    creator?: string;
    /**
     * Sort the returned list by the given column, before limiting.
     * Accepted column names are:
     *
     *  - `created`
     *  - `used`
     *  - `description`
     */
    sort?: "created" | "used" | "description";
    /**
     * The direction of the sorting. Ascending or Descending.
     */
    sortDirection?: "asc" | "desc";
}

@controller @component
export class Playlists {
    @inject private db: Connection;
    @inject private config: ServerConfig;

    /**
     * Query the playlists from the database using a `PlaylistsQuery`.
     *
     * @return A list of all playlists matching the given criteria.
     */
    public async queryPlaylists(playlistsQuery: PlaylistsQuery = {}): Promise<PlaylistsQueryResult> {
        return await this.listPlaylists(
            playlistsQuery.search,
            playlistsQuery.limit,
            playlistsQuery.offset,
            playlistsQuery.creator,
            playlistsQuery.sort,
            playlistsQuery.sortDirection,
        );
    }

    @route("GET", "/playlists").dump(PlaylistsQueryResult, listPlaylists)
    public async listPlaylists(
        @query("search") @is() search?: string,
        @query("limit") @is(DataType.int) limit?: number,
        @query("offset") @is(DataType.int) offset?: number,
        @query("creator") @is().validate(uuid) creator?: string,
        @query("sort") @is().validate(oneOf("created", "used", "description")) sort?: string,
        @query("sortDirection") @is().validate(oneOf("asc", "desc")) sortDirection?: string,
    ): Promise<PlaylistsQueryResult> {
        const queryBuilder = this.db.getRepository(Playlist).createQueryBuilder("playlist")
            .leftJoinAndSelect("playlist.creator", "creator")
            .leftJoinAndSelect("playlist.entries", "entry")
            .leftJoinAndSelect("entry.sound", "sound");
        if (search) {
            const vectorSearch = search.replace(/\s/, " & ");
            const { language } = this.config;
            queryBuilder.andWhere(new Brackets(subQuery => {
                subQuery.where("to_tsvector(:language, playlist.description) @@ to_tsquery(:language, :vectorSearch)", {
                    language,
                    vectorSearch,
                })
                .orWhere("playlist.description ILIKE :escapedSearch", { escapedSearch: `%${search}%` });
            }));
        }
        if (creator) { queryBuilder.andWhere("creator.id = :creator", { creator }); }
        const totalPlaylists = await queryBuilder.getCount();
        const direction = sortDirection === "desc" ? "DESC" : "ASC";
        switch (sort) {
            case "used": queryBuilder.addOrderBy("playlist.used", direction); break;
            case "description": queryBuilder.addOrderBy("playlist.description", direction); break;
            case "created": default: queryBuilder.addOrderBy("playlist.created", direction); break;
        }
        if (offset) { queryBuilder.skip(offset); }
        if (limit) { queryBuilder.take(limit); }
        else { queryBuilder.take(100); }

        const playlists = await queryBuilder.getMany();
        playlists.forEach(playlist => playlist.entries.sort((a, b) => a.position - b.position));
        return ok(populate(world, PlaylistsQueryResult, { totalPlaylists, limit, offset, playlists }));
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
