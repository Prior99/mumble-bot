import { ForkOptions } from "../models";
import { context, body, controller, route, param, is, uuid, ok, query, specify, created } from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";
import { verbose } from "winston";
import FFMpeg from "fluent-ffmpeg";

import { AudioOutput } from "../../server";
import { ServerConfig } from "../../config";
import { Recording, PlaybackOptions } from "../models";
import { updateRecording, world } from "../scopes";
import { Context } from "../context";

@controller @component
export class Recordings {
    @inject private db: Connection;
    @inject private audioOutput: AudioOutput;
    @inject private config: ServerConfig;

    @route("GET", "/recording/:id").dump(Recording, world)
    public async getRecording(@param("id") @is().validate(uuid) id: string): Promise<Recording> {
        const recording = await this.db.getRepository(Recording).findOne(id);
        return ok(recording);
    }

    @route("POST", "/recording/:id").dump(Recording, world)
    public async postRecording(
        @param("id") @is().validate(uuid) id: string,
        @body(updateRecording) recording: Recording,
        @context ctx?: Context,
    ): Promise<Recording>{
        await this.db.getRepository(Recording).update(id, recording);

        const { username } = await ctx.currentUser();
        verbose(`${username} edited record #${id}`);

        const updated = await this.getRecording(id);
        return ok(updated);
    }

    @route("GET", "/recordings").dump(Recording, world)
    public async listRecordings(
        @query("since") @is() @specify(() => Date) since?: Date,
    ): Promise<Recording[]> {
        const queryBuilder = this.db.getRepository(Recording).createQueryBuilder("recording");
        if (since) {
            queryBuilder.andWhere("submitted > :since", { since });
        }
        const recordings = await queryBuilder.getMany();

        return ok(recordings);
    }

    @route("POST", "/recording/:id/play")
    public async playRecording(
        @param("id") @is().validate(uuid) id: string,
        @body() playbackOptions: PlaybackOptions,
        @context ctx?: Context,
    ): Promise<{}> {
        const { pitch } = playbackOptions;
        const recording = await this.getRecording(id);
        recording.used ++;
        await this.db.getRepository(Recording).save(recording);

        const currentUser = await ctx.currentUser();
        const { username } = currentUser;

        this.audioOutput.playSound(`${this.config.recordingsDir}/${id}`, {
            type: "recording",
            recording,
            user: currentUser,
        });

        verbose(`${username} played back record #${id}`);

        return ok(recording);
    }

    private crop(begin: number, end: number, oldId: string, newId: string): Promise<undefined> {
        return new Promise((resolve, reject) => {
            FFMpeg(`${this.config.recordingsDir}/${oldId}`)
                .seekInput(begin)
                .duration(end - begin)
                .format("mp3")
                .audioCodec("libmp3lame")
                .on("error", (err) => reject(err))
                .save(`${this.config.recordingsDir}/${newId}`)
                .on("end", () => resolve());
        });
    }

    @route("POST", "/recording/:id/fork").dump(Recording, world)
    public async forkRecording(
        @param("id") @is().validate(uuid) id: string,
        @body() options: ForkOptions,
        @context ctx?: Context,
    ): Promise<{}> {
        const { actions, quote, overwrite } = options;
        const original = await this.getRecording(id);

        const currentUser = await ctx.currentUser();
        const { username } = currentUser;
        const oldDuration = original.duration;
        const newDuration = actions.reduce((result, action) =>
            action.action === "crop" ? action.begin - action.end + result : result,
            0,
        );

        const newRecording = await this.db.getRepository(Recording).save({
            ...original,
            quote,
            overwrite,
            duration: newDuration,
            reporter: currentUser,
        });

        verbose(`${username} is forking record #${id}`);
        await Promise.all(actions.map(async action => {
            await this.crop(action.begin, action.end, original.id, newRecording.id);
        }));

        return created(newRecording);
    }
}
