import { ForkOptions } from "../models";
import mkdirp = require("mkdirp-promise");
import {
    context,
    body,
    controller,
    route,
    param,
    is,
    uuid,
    ok,
    query,
    created,
    DataType,
    oneOf,
    notFound,
    populate,
    badRequest,
} from "hyrest";
import { rename } from "fs-extra";
import { component, inject } from "tsdi";
import { Connection, Brackets } from "typeorm";
import { verbose } from "winston";
import * as FFMpeg from "fluent-ffmpeg";
import { ServerConfig } from "../../config";
import { CachedAudio, SoundsQueryResult, Sound, Tag, SoundTagRelation } from "../models";
import { createSound, updateSound, world, tagSound } from "../scopes";
import { AudioCache } from "../../server";
import { Context } from "../context";

export interface SoundsQuery {
    /**
     * A string to search in the description of a sound for.
     */
    search?: string;
    /**
     * Limit the amount of returned sounds to this amount.
     */
    limit?: number;
    /**
     * Offset for the pagination by absolute amount of sounds.
     */
    offset?: number;
    /**
     * Limit the returned sounds to sounds created after this date.
     */
    startDate?: Date;
    /**
     * Limit the returned sounds to sounds created before this date.
     */
    endDate?: Date;
    /**
     * Limit the returned sounds to sounds created by this user.
     */
    creator?: string;
    /**
     * Limit the returned sounds to sounds spoken by this user.
     */
    user?: string;
    /**
     * Limit the returned sounds tagged with the ids of these labels.
     */
    tags?: string[];
    /**
     * Limit the returned sounds to sounds from the specified source.
     * Sources are: `upload` and `recording`.
     */
    source?: "upload" | "recording";
    /**
     * Sort the returned list by the given column, before limiting.
     * Accepted column names are:
     *
     *  - `created`
     *  - `updated`
     *  - `used`
     *  - `duration`
     *  - `description`
     */
    sort?: "created" | "updated" | "used" | "duration" | "description";
    /**
     * The direction of the sorting. Ascending or Descending.
     */
    sortDirection?: string;
}

@controller @component
export class Sounds {
    @inject private db: Connection;
    @inject private config: ServerConfig;
    @inject private cache: AudioCache;

    /**
     * Fetch a single sound with a specified id.
     *
     * @param id The id of the sound to retrieve.
     *
     * @return The sound with the specified id.
     */
    @route("GET", "/sound/:id").dump(Sound, world)
    public async getSound(@param("id") @is().validate(uuid) id: string): Promise<Sound> {
        const sound = await this.db.getRepository(Sound).createQueryBuilder("sound")
            .where("sound.id = :id", { id })
            .leftJoinAndSelect("sound.creator", "creator")
            .leftJoinAndSelect("sound.user", "user")
            .leftJoinAndSelect("sound.soundTagRelations", "soundTagRelation")
            .leftJoinAndSelect("soundTagRelation.tag", "tag")
            .getOne();
        if (!sound) {
            return notFound<Sound>(`No sound with id "${id}"`);
        }
        return ok(sound);
    }

    /**
     * Remove a tag from a sound.
     *
     * @param soundId The id of the sound from which the tag should be deleted.
     * @param tagId The id of the tag to remove from the sound
     *
     * @return The modified sound.
     */
    @route("DELETE", "/sound/:soundId/tag/:tagId").dump(Sound, world)
    public async untagSound(
        @param("soundId") @is().validate(uuid) soundId: string,
        @param("tagId") @is().validate(uuid) tagId: string,
        @context ctx?: Context,
    ): Promise<Sound>{
        if (!await this.db.getRepository(Sound).findOne(soundId)) {
            return notFound<Sound>(`No sound with id "${soundId}"`);
        }
        if (!await this.db.getRepository(Tag).findOne(tagId)) {
            return notFound<Sound>(`No tag with id "${tagId}"`);
        }
        await this.db.getRepository(SoundTagRelation).delete({
            sound: { id: soundId },
            tag: { id: tagId },
        });
        const { name } = await ctx.currentUser();
        verbose(`${name} removed tag #${tagId} from sound #${soundId}`);
        return ok(await this.getSound(soundId));
    }

    /**
     * Add a tag to a sound.
     *
     * @param id The id of the sound to which the tag should be added.
     * @param tag The tag to add to the sound.
     *
     * @return The modified sound.
     */
    @route("POST", "/sound/:id/tags").dump(Sound, world)
    public async tagSound(
        @param("id") @is().validate(uuid) id: string,
        @body(tagSound) tag: Tag,
        @context ctx?: Context,
    ): Promise<Sound>{
        if (!await this.db.getRepository(Sound).findOne(id)) {
            return notFound<Sound>(`No sound with id "${id}"`);
        }
        if (!await this.db.getRepository(Tag).findOne(tag.id)) {
            return notFound<Sound>(`No tag with id "${tag.id}"`);
        }
        await this.db.getRepository(SoundTagRelation).save({
            sound: { id },
            tag,
        });

        const { name } = await ctx.currentUser();
        verbose(`${name} tagged sound #${id} with ${tag.id}`);
        return created(await this.getSound(id));
    }

    @route("POST", "/sound/:id").dump(Sound, world)
    public async updateSound(
        @param("id") @is().validate(uuid) id: string,
        @body(updateSound) sound: Sound,
        @context ctx?: Context,
    ): Promise<Sound>{
        await this.db.getRepository(Sound).update(id, sound);

        const { name } = await ctx.currentUser();
        verbose(`${name} edited sound #${id}`);

        const updated = await this.getSound(id);
        return ok(updated);
    }

    /**
     * Query the sounds from the database using a `SoundsQuery`.
     *
     * @return A list of all sounds matching the given criteria.
     */
    public async querySounds(soundQuery: SoundsQuery = {}): Promise<SoundsQueryResult> {
        return await this.listSounds(
            soundQuery.search,
            soundQuery.limit,
            soundQuery.offset,
            soundQuery.startDate && soundQuery.startDate.toString(),
            soundQuery.endDate && soundQuery.endDate.toString(),
            soundQuery.creator,
            soundQuery.user,
            soundQuery.tags && soundQuery.tags.join(","),
            soundQuery.source,
            soundQuery.sort,
            soundQuery.sortDirection,
        );
    }

    @route("GET", "/sounds").dump(SoundsQueryResult, world)
    protected async listSounds(
        @query("search") @is() search?: string,
        @query("limit") @is(DataType.int) limit?: number,
        @query("offset") @is(DataType.int) offset?: number,
        @query("startDate") @is() startDate?: string,
        @query("endDate") @is() endDate?: string,
        @query("creator") @is().validate(uuid) creator?: string,
        @query("user") @is().validate(uuid) user?: string,
        @query("tags") @is() tags?: string,
        @query("source") @is().validate(oneOf("upload", "recording")) source?: string,
        @query("sort") @is().validate(oneOf("created", "updated", "used", "duration", "description")) sort?: string,
        @query("sortDirection") @is().validate(oneOf("asc", "desc")) sortDirection?: string,
    ): Promise<SoundsQueryResult> {
        const queryBuilder = this.db.getRepository(Sound).createQueryBuilder("sound")
            .leftJoinAndSelect("sound.soundTagRelations", "soundTagRelation")
            .leftJoinAndSelect("soundTagRelation.tag", "tag")
            .leftJoinAndSelect("sound.creator", "creator")
            .leftJoinAndSelect("sound.user", "user");
        if (startDate) { queryBuilder.andWhere("created > :startDate", { startDate: new Date(startDate) }); }
        if (endDate) { queryBuilder.andWhere("created < :endDate", { endDate: new Date(endDate) }); }
        if (search) {
            queryBuilder.andWhere(new Brackets(subQuery => {
                subQuery.where("to_tsvector(description) @@ to_tsquery(:search)", { search })
                    .orWhere("description ILIKE :escapedSearch", { escapedSearch: `%${search}%` });
            }));
        }
        if (creator) { queryBuilder.andWhere("creator.id = :creator", { creator }); }
        if (user) { queryBuilder.andWhere("user.id = :user", { user }); }
        if (tags) {
            queryBuilder.andWhere(`
                ARRAY(
                    SELECT "tagId"
                    FROM sound innerSound
                    LEFT JOIN sound_tag_relation innerRelation ON innerRelation."soundId" = sound.id
                    WHERE innerSound.id = sound.id
                ) @> :tags
            `, { tags: tags.split(",") });
        }
        if (source) { queryBuilder.andWhere("source = :source", { source }); }
        const totalSounds = await queryBuilder.getCount();
        const direction = sortDirection === "desc" ? "DESC" : "ASC";
        switch (sort) {
            case "updated": queryBuilder.orderBy("sound.updated", direction); break;
            case "used": queryBuilder.orderBy("sound.used", direction); break;
            case "duration": queryBuilder.orderBy("sound.duration", direction); break;
            case "description": queryBuilder.orderBy("sound.description", direction); break;
            case "created": default: queryBuilder.orderBy("sound.created", direction); break;
        }

        if (offset) { queryBuilder.skip(offset); }
        if (limit) { queryBuilder.take(limit); }
        else { queryBuilder.take(100); }

        const sounds = await queryBuilder.getMany();
        return ok(populate(world, SoundsQueryResult, { totalSounds, limit, offset, sounds }));
    }

    private crop(begin: number, end: number, oldId: string, newId: string): Promise<undefined> {
        return new Promise((resolve, reject) => {
            FFMpeg(`${this.config.soundsDir}/${oldId}`)
                .seekInput(begin)
                .duration(end - begin)
                .format("mp3")
                .audioCodec("libmp3lame")
                .on("error", (err) => reject(err))
                .save(`${this.config.soundsDir}/${newId}`)
                .on("end", () => resolve());
        });
    }

    @route("POST", "/sounds").dump(Sound, world)
    public async save(@body(createSound) { id }: CachedAudio, @context ctx?: Context): Promise<Sound> {
        const cachedAudio = this.cache.byId(id);
        if (!cachedAudio) {
            return badRequest<undefined>(`No cached sound with id "${cachedAudio.id}" found.`);
        }
        const { date, duration, user } = cachedAudio;
        try {
            await mkdirp(this.config.soundsDir);
        } catch (e) {
            if (e.code !== "EEXIST") { throw e; }
        }
        const currentUser = await ctx.currentUser();
        const sound = Object.assign(new Sound(), {
            duration,
            user,
            created: date,
            creator: currentUser,
            description: `Recording from ${date.toISOString()}`,
            source: "recording",
        });
        await this.db.getRepository(Sound).save(sound);

        await rename(`${this.config.tmpDir}/${id}`, `${this.config.soundsDir}/${sound.id}`);
        try {
            await rename(`${this.config.tmpDir}/${id}.png`, `${this.config.soundsDir}/${sound.id}.png`);
        } catch (err) {
            if (err.code !== "ENOENT") { throw err; }
        }

        this.cache.remove(id);
        verbose(`${currentUser.name} added new recording #${sound.id}`);

        return created(sound);
    }

    @route("POST", "/sound/:id/fork").dump(Sound, world)
    public async forkSound(
        @param("id") @is().validate(uuid) id: string,
        @body() options: ForkOptions,
        @context ctx?: Context,
    ): Promise<{}> {
        const { actions, quote, overwrite } = options;
        const original = await this.getSound(id);

        const currentUser = await ctx.currentUser();
        const { name } = currentUser;
        const newDuration = actions.reduce((result, action) =>
            action.action === "crop" ? action.begin - action.end + result : result,
            0,
        );

        const newSound = await this.db.getRepository(Sound).save({
            ...original,
            quote,
            overwrite,
            duration: newDuration,
            creator: currentUser,
        });

        verbose(`${name} is forking record #${id}`);
        await Promise.all(actions.map(async action => {
            await this.crop(action.begin, action.end, original.id, newSound.id);
        }));

        return created(newSound);
    }
}
