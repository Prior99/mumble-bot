import { mkdirp } from "fs-extra";
import * as Uuid from "uuid";
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
    conflict,
} from "hyrest";
import { omit } from "ramda";
import { rename, unlink, writeFile, createWriteStream, existsSync } from "fs-extra";
import { component, inject } from "tsdi";
import { Connection, Brackets } from "typeorm";
import { verbose, error } from "winston";
import * as FFMpeg from "fluent-ffmpeg";
import * as YoutubeDl from "youtube-dl";
import { ServerConfig } from "../../config";
import {
    ForkOptions,
    CachedAudio,
    SoundsQueryResult,
    Sound,
    Tag,
    SoundTagRelation,
    Upload,
    YoutubeImport,
} from "../models";
import { createSound, updateSound, world, tagSound, upload, youtubeImport } from "../scopes";
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
    source?: "upload" | "recording" | "youtube";
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
            .leftJoin("sound.parent", "parent")
            .leftJoin("sound.children", "children")
            .addSelect("parent.id")
            .addSelect("children.id")
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
        const sound = await this.db.getRepository(Sound).findOne({
            where: { id },
            relations: ["soundTagRelations", "soundTagRelations.tag"],
        });
        if (!sound) {
            return notFound<Sound>(`No sound with id "${id}"`);
        }
        if (!await this.db.getRepository(Tag).findOne(tag.id)) {
            return notFound<Sound>(`No tag with id "${tag.id}"`);
        }
        if (sound.soundTagRelations.some(relation => relation.tag.id === tag.id)) {
            return conflict<Sound>(`Sound was already tagged with tag "${tag.id}"`);
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
        if (!await this.db.getRepository(Sound).findOne(id)) {
            return notFound<Sound>(`No sound with id "${id}"`);
        }
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
        @query("source") @is().validate(oneOf("upload", "recording", "youtube")) source?: string,
        @query("sort") @is().validate(oneOf("created", "updated", "used", "duration", "description")) sort?: string,
        @query("sortDirection") @is().validate(oneOf("asc", "desc")) sortDirection?: string,
    ): Promise<SoundsQueryResult> {
        const queryBuilder = this.db.getRepository(Sound).createQueryBuilder("sound")
            .leftJoinAndSelect("sound.soundTagRelations", "soundTagRelation")
            .leftJoinAndSelect("soundTagRelation.tag", "tag")
            .leftJoinAndSelect("sound.creator", "creator")
            .leftJoinAndSelect("sound.user", "user")
            .leftJoin("sound.parent", "parent")
            .leftJoin("sound.children", "children")
            .addSelect("parent.id")
            .addSelect("children.id");
        if (startDate) { queryBuilder.andWhere("sound.created > :startDate", { startDate: new Date(startDate) }); }
        if (endDate) { queryBuilder.andWhere("sound.created < :endDate", { endDate: new Date(endDate) }); }
        if (search) {
            const vectorSearch = search.replace(/\s/, " & ");
            const { language } = this.config;
            queryBuilder.andWhere(new Brackets(subQuery => {
                subQuery.where("to_tsvector(:language, sound.description) @@ to_tsquery(:language, :vectorSearch)", {
                    language,
                    vectorSearch,
                })
                .orWhere("sound.description ILIKE :escapedSearch", { escapedSearch: `%${search}%` });
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
        if (source) { queryBuilder.andWhere("sound.source = :source", { source }); }
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

    private async getMetaInfo(path: string) {
        return new Promise((resolve, reject) => {
            FFMpeg.ffprobe(path, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
    }

    private async getYoutubeDlInfo(url: string) {
        return new Promise<YoutubeDl.Info>((resolve, reject) => {
            YoutubeDl.getInfo(url, [], (err, videoInfo) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(videoInfo);
            });
        });
    }

    @route("POST", "/sounds/youtube").dump(Sound, world)
    public async importYoutube(@body(youtubeImport) { url }: YoutubeImport, @context ctx?: Context): Promise<Sound> {
        try {
            await mkdirp(this.config.soundsDir);
        } catch (e) {
            if (e.code !== "EEXIST") { throw e; }
        }

        const currentUser = await ctx.currentUser();
        let info: YoutubeDl.Info;
        try {
            info = await this.getYoutubeDlInfo(url);
        } catch (err) {
            return badRequest<Sound>("Could not gather meta information about provided URL.");
        }
        const tmpPath = `${this.config.tmpDir}/youtube-${Uuid.v4()}`;
        try {
            await new Promise(resolve => {
                YoutubeDl(url, ["--extract-audio", "--audio-format=mp3"], {})
                    .on("end", resolve)
                    .pipe(createWriteStream(tmpPath));
            });
        } catch (err) {
            if (existsSync(tmpPath)) { await unlink(tmpPath); }
            error(`Error downloading youtube video for url "${url}"`);
            return badRequest<Sound>("Connection to YouTube interrupted.");
        }
        let soundMeta: any;
        try {
            soundMeta = await this.getMetaInfo(tmpPath);
        } catch (err) {
            error(`Error processing meta information for downloaded file from url "${tmpPath}"`, err);
            await unlink(tmpPath);
            return badRequest<Sound>("Unable to process meta information for downloaded file.");
        }
        if (typeof soundMeta.format.duration !== "number") {
            await unlink(tmpPath);
            return badRequest<Sound>("Invalid audio file extracted from youtube download.");
        }
        if (!soundMeta.streams.some(stream => stream.codec_type === "audio")) {
            await unlink(tmpPath);
            return badRequest<Sound>("Media file extracted from youtube download did not contain an audio stream.");
        }
        const sound = Object.assign(new Sound(), {
            duration: soundMeta.format.duration,
            created: new Date(),
            creator: currentUser,
            description: info.title,
            source: "youtube",
        });
        await this.db.getRepository(Sound).save(sound);
        await rename(tmpPath, `${this.config.soundsDir}/${sound.id}`);

        verbose(`${currentUser.name} added new sound imported from youtube with id #${sound.id}.`);

        return created(sound);
    }

    @route("POST", "/sounds/upload").dump(Sound, world)
    public async upload(@body(upload) { content, filename }: Upload, @context ctx?: Context): Promise<Sound> {
        try {
            await mkdirp(this.config.soundsDir);
        } catch (e) {
            if (e.code !== "EEXIST") { throw e; }
        }
        const currentUser = await ctx.currentUser();
        const tmpPath = `${this.config.tmpDir}/upload-${Uuid.v4()}`;
        await writeFile(tmpPath, Buffer.from(content, "base64"));
        let soundMeta: any;
        try {
            soundMeta = await this.getMetaInfo(tmpPath);
        } catch (err) {
            error(`Error processing meta information for upload "${tmpPath}"`, err);
            await unlink(tmpPath);
            return badRequest<Sound>("Unable to process meta information for upload");
        }
        if (typeof soundMeta.format.duration !== "number") {
            await unlink(tmpPath);
            return badRequest<Sound>("Invalid audio file");
        }
        if (!soundMeta.streams.some(stream => stream.codec_type === "audio")) {
            await unlink(tmpPath);
            return badRequest<Sound>("Media file did not contain an audio stream");
        }
        const sound = Object.assign(new Sound(), {
            duration: soundMeta.format.duration,
            created: new Date(),
            creator: currentUser,
            description: filename,
            source: "upload",
        });
        await this.db.getRepository(Sound).save(sound);
        await rename(tmpPath, `${this.config.soundsDir}/${sound.id}`);

        verbose(`${currentUser.name} added new uploaded sound #${sound.id}`);

        return created(sound);
    }

    @route("POST", "/sounds").dump(Sound, world)
    public async save(@body(createSound) { id }: CachedAudio, @context ctx?: Context): Promise<Sound> {
        const cachedAudio = this.cache.byId(id);
        if (!cachedAudio) {
            return badRequest<undefined>(`No cached sound with id "${id}" found.`);
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
    ): Promise<Sound> {
        const original = await this.db.getRepository(Sound).findOne({
            where: { id },
            relations: ["parent", "children", "user", "creator"],
        });
        if (!original) {
            return notFound<Sound>(`No sound with id ${id}`);
        }

        const { actions, description, overwrite } = options;
        if (actions.length === 0) {
            return badRequest<Sound>("No actions specified");
        }
        const invalidAction = actions.some(({ start, end }) => {
            return start < 0 || start > original.duration || end < start || end > original.duration;
        });
        if (invalidAction) {
            return badRequest<Sound>("Invalid action");
        }

        const currentUser = await ctx.currentUser();
        const newDuration = actions.reduce((result, { action, start, end }) => {
            return action === "crop" ? end - start + result : result;
        }, 0);
        const newSound: Sound = await this.db.getRepository(Sound).save({
            ...omit(["id"], original),
            description,
            overwrite,
            duration: newDuration,
            creator: currentUser,
            parent: original,
        });

        await Promise.all(actions.map(action => this.crop(action.start, action.end, original.id, newSound.id)));

        verbose(`User ${currentUser.id} is forked sound ${id} to ${newSound.id}`);
        return created(await this.getSound(newSound.id));
    }
}
