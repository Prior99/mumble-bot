import mkdirp = require("mkdirp-promise"); // tslint:disable-line
import { rename } from "async-file";
import { context, notFound, body, controller, route, param, is, uuid, ok } from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";
import { verbose, error } from "winston";

import { ServerConfig } from "../../config";
import { AudioOutput, AudioCache } from "../../server";
import { CachedAudio, Recording } from "../models";
import { createRecording, world } from "../scopes";
import { Context } from "../context";

@controller @component
export class Cached {
    @inject private db: Connection;
    @inject private audioOutput: AudioOutput;
    @inject private config: ServerConfig;
    @inject private cache: AudioCache;

    @route("GET", "/cached")
    public async listCached(): Promise<CachedAudio[]> {
        return ok(this.cache.sorted);
    }

    private async createRecordingDirectory() {
        try {
            await mkdirp(this.config.recordingsDir);
        }
        catch (e) {
            if (e.code !== "EEXIST") { throw e; }
        }
    }

    @route("POST", "/cached/:id/save").dump(Recording, world)
    public async saveCached(
        @param("id") @is().validate(uuid) id: string,
        @body(createRecording) recording: Recording,
        @context ctx?: Context
    ): Promise<Recording> {
        const cached = this.cache.byId(id);
        if (!cached) {
            return notFound<undefined>(`No cached recording with id "${id}" found.`);
        }

        await this.createRecordingDirectory();

        await this.db.getRepository(Recording).save(recording);

        await rename(cached.file, `${this.config.recordingsDir}/${recording.id}`);
        await rename(cached.file + ".png", `${this.config.visualizationsDir}/${recording.id}.png`);

        const currentUser = await ctx.currentUser();

        this.cache.remove(cached.id);
        verbose(`${currentUser.username} added new record #${recording.id}`);

        return ok();
    }

    @route("POST", "/cached/:id/protect").dump(CachedAudio, world)
    public async protectCached(@param("id") @is().validate(uuid) id: string): Promise<CachedAudio> {
        if (this.cache.protect(id)) {
            return ok();
        }
        return notFound<undefined>(`No cached recording with id "${id}" found.`);
    }

    @route("POST", "/cached/:id/play")
    public async playCached(@param("id") @is().validate(uuid) id: string, @context ctx?: Context): Promise<{}> {
        const cached = this.cache.byId(id);
        if (!cached) { return notFound<undefined>(`No cached recording with id "${id}" found.`); }

        const currentUser = await ctx.currentUser();

        this.audioOutput.playSound(cached.file, {
            type: "cached",
            cachedRecording: cached,
            user: currentUser
        });
        verbose(`${currentUser.username} played back cached audio with id ${id}`);
        return ok();
    }

    @route("DELETE", "/cached/:id")
    public async deleteCached(@param("id") @is().validate(uuid) id: string): Promise<{}> {
        if (this.cache.remove(id)) {
            return ok();
        }
        return notFound<undefined>(`No cached recording with id "${id}" found.`);
    }
}
