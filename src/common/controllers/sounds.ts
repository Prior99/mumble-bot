import { ForkOptions } from "../models";
import { context, body, controller, route, param, is, uuid, ok, query, specify, created, DataType } from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";
import { verbose } from "winston";
import * as FFMpeg from "fluent-ffmpeg";
import { AudioOutput } from "../../server";
import { ServerConfig } from "../../config";
import { Sound, PlaybackOptions } from "../models";
import { updateSound, world } from "../scopes";
import { Context } from "../context";

@controller @component
export class Sounds {
    @inject private db: Connection;
    @inject private audioOutput: AudioOutput;
    @inject private config: ServerConfig;

    @route("GET", "/sound/:id").dump(Sound, world)
    public async getSound(@param("id") @is().validate(uuid) id: string): Promise<Sound> {
        const sound = await this.db.getRepository(Sound).findOne(id);
        return ok(sound);
    }

    @route("POST", "/sound/:id").dump(Sound, world)
    public async postSound(
        @param("id") @is().validate(uuid) id: string,
        @body(updateSound) sound: Sound,
        @context ctx?: Context,
    ): Promise<Sound>{
        await this.db.getRepository(Sound).update(id, sound);

        const { name } = await ctx.currentUser();
        verbose(`${name} edited record #${id}`);

        const updated = await this.getSound(id);
        return ok(updated);
    }

    @route("GET", "/sounds").dump(Sound, world)
    public async listSounds(
        @query("search") @is() search?: string,
        @query("limit") @is(DataType.int) limit?: number,
        @query("offset") @is(DataType.int) offset?: number,
        @query("startDate") @is() @specify(() => Date) startDate?: Date,
        @query("endDate") @is() @specify(() => Date) endDate?: Date,
        @query("creator") @is().validate(uuid) creator?: string,
        @query("user") @is().validate(uuid) user?: string,
        @query("tags") @is() tags?: string,
    ): Promise<Sound[]> {
        const queryBuilder = this.db.getRepository(Sound).createQueryBuilder("sound")
            .leftJoinAndSelect("sound.soundTagRelations", "soundTagRelation");
        if (startDate) { queryBuilder.andWhere("created > :startDate", { startDate }); }
        if (endDate) { queryBuilder.andWhere("created > :endDate", { endDate }); }
        if (search) { queryBuilder.andWhere("to_tsvector(description) @@ to_tsquery(:search)", { search }); }
        if (creator) { queryBuilder.andWhere("creatorId = :creator", { creator }); }
        if (user) { queryBuilder.andWhere("userId = :user", { user }); }
        if (tags) {
            const tagsArray = tags.split(",");
            tagsArray.forEach(tag => {
                queryBuilder.andWhere("soundTagRelation.id = :tag", { tag });
            });
        }
        if (limit) { queryBuilder.limit(limit); }
        if (offset) { queryBuilder.limit(offset); }

        const sounds = await queryBuilder.getMany();
        return ok(sounds);
    }

    @route("POST", "/sound/:id/play")
    public async playSound(
        @param("id") @is().validate(uuid) id: string,
        @body() playbackOptions: PlaybackOptions,
        @context ctx?: Context,
    ): Promise<{}> {
        const sound = await this.getSound(id);
        sound.used ++;
        await this.db.getRepository(Sound).save(sound);

        const currentUser = await ctx.currentUser();
        const { name } = currentUser;

        this.audioOutput.playSound(`${this.config.soundsDir}/${id}`, {
            type: "sound",
            sound,
            user: currentUser,
        });

        verbose(`${name} played back record #${id}`);

        return ok(sound);
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
