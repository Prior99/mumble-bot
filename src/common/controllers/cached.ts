import mkdirp = require("mkdirp-promise"); // tslint:disable-line
import { rename } from "async-file";
import { context, notFound, body, controller, route, param, is, uuid, ok } from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";
import { verbose, error } from "winston";

import { CachedAudio, Recording } from "../models";
import { createRecording, world } from "../scopes";
import { Bot } from "..";
import { Context } from "../context";
import { compareCachedAudio } from "../utils";

@controller @component
export class Cached {
    @inject private db: Connection;
    @inject private bot: Bot;

    @route("GET", "/cached")
    public async listCached(): Promise<CachedAudio[]> {
        return ok(this.bot.cachedAudios.slice().sort(compareCachedAudio));
    }

    private async createRecordingDirectory() {
        try {
            await mkdirp(this.bot.options.paths.recordings);
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
        const cached = this.bot.getCachedAudioById(id);
        if (!cached) {
            return notFound<undefined>(`No cached recording with id "${id}" found.`);
        }

        await this.createRecordingDirectory();

        await this.db.getRepository(Recording).save(recording);

        await rename(cached.file, `${this.bot.options.paths.recordings}/${recording.id}`);
        await rename(cached.file + ".png", `${this.bot.options.paths.visualizations}/${recording.id}.png`);

        const currentUser = await ctx.currentUser();

        this.bot.removeCachedAudio(cached);
        verbose(`${currentUser.username} added new record #${recording.id}`);

        return ok();
    }

    @route("POST", "/cached/:id/protect").dump(CachedAudio, world)
    public async protectCached(@param("id") @is().validate(uuid) id: string): Promise<CachedAudio> {
        if (this.bot.protectCachedAudio(id)) {
            return ok();
        }
        return notFound<undefined>(`No cached recording with id "${id}" found.`);
    }

    @route("POST", "/cached/:id/play")
    public async playCached(@param("id") @is().validate(uuid) id: string, @context ctx?: Context): Promise<{}> {
        const cached = this.bot.getCachedAudioById(id);
        if (!cached) { return notFound<undefined>(`No cached recording with id "${id}" found.`); }

        const currentUser = await ctx.currentUser();

        this.bot.playSound(cached.file, {
            type: "cached",
            cachedRecording: cached,
            user: currentUser
        });
        verbose(`${currentUser.username} played back cached audio with id ${id}`);
        return ok();
    }

    @route("DELETE", "/cached/:id")
    public async deleteCached(@param("id") @is().validate(uuid) id: string): Promise<{}> {
        if (this.bot.removeCachedAudioById(id)) {
            return ok();
        }
        return notFound<undefined>(`No cached recording with id "${id}" found.`);
    }
}
