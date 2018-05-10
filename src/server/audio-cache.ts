import { component, inject, initialize } from "tsdi";
import mkdirp = require("mkdirp-promise");
import { Connection } from "typeorm";
import { existsSync, writeFile, unlink, readFile } from "fs-extra";
import { error, info } from "winston";
import { EventEmitter } from "events";
import { ServerConfig } from "../config";
import { CachedAudio, User } from "../common";

@component
export class AudioCache extends EventEmitter {
    @inject private db: Connection;
    @inject private config: ServerConfig;

    public cachedAudios = new Map<string, CachedAudio>();
    public cacheAmount = 4;

    private get cachedAudioIndexFilePath() { return `${this.config.tmpDir}/useraudio.json`; }

    private async createTmpDirectory() {
        try {
            await mkdirp(this.config.tmpDir);
        }
        catch (e) {
            if (e.code !== "EEXIST") { throw e; }
        }
    }

    private async importCache() {
        if (!existsSync(this.cachedAudioIndexFilePath)) { return; }
        try {
            const json = JSON.parse(await readFile(this.cachedAudioIndexFilePath, "utf8"));
            json.map(async ({ id, userId, duration, date, amplitude }) => {
                const user = await this.db.getRepository(User).findOne(userId);
                const cachedAudio = Object.assign(new CachedAudio(), {
                    id,
                    user,
                    duration,
                    date: new Date(date),
                    amplitude,
                });
                this.cachedAudios.set(id, cachedAudio);
            });
        } catch (err) {
            if (err.code !== "ENOENT") { throw err; }
            info("No previous index of cached audios found.");
        }
    }

    private async exportCache() {
        const exported = this.all.map(cachedAudio => ({
            id: cachedAudio.id,
            userId: cachedAudio.user.id,
            duration: cachedAudio.duration,
            date: cachedAudio.date,
            amplitude: cachedAudio.amplitude,
        }));
        await writeFile(this.cachedAudioIndexFilePath, JSON.stringify(exported));
    }

    @initialize
    protected async initialize() {
        await this.createTmpDirectory();
        if (this.config.audioCacheAmount) { this.cacheAmount = this.config.audioCacheAmount; }
        this.importCache();
    }

    /**
     * Add an audio file to the list of cached audios.
     */
    public async add(cachedAudio: CachedAudio) {
        this.cachedAudios.set(cachedAudio.id, cachedAudio);
        this.emit("add", cachedAudio);
        this.cleanUp();
        this.exportCache();
    }

    public get all() { return Array.from(this.cachedAudios.values()); }

    public get sorted() {
        return this.all.sort((a, b) => {
            if (a.date > b.date) { return -1; }
            if (a.date < b.date) { return 1; }
            return 0;
        });
    }

    private async cleanUp() {
        const list = this.sorted;
        await Promise.all(list.map(async cachedAudio => {
            if (this.cachedAudios.size <= this.cacheAmount) { return; }
            this.cachedAudios.delete(cachedAudio.id);
            try {
                await unlink(`${this.config.tmpDir}/${cachedAudio.id}`);
            } catch (err) {
                error(`Error when cleaning up sound file for sound ${cachedAudio.id}`, err);
            }
            try {
                await unlink(`${this.config.tmpDir}/${cachedAudio.id}.png`);
            } catch (err) {
                if (err.code !== "ENOENT") {
                    error(`Error when cleaning up visualization file for sound ${cachedAudio.id}`, err);
                }
            }
            this.emit("remove", cachedAudio);
            info(`Deleted files for cached audio ${cachedAudio.id}.`);
        }));
    }
    /**
     * Removes the cached audio with the given id.
     * @param id Id of the audio to remove.
     * @return False when the id was invalid.
     */
    public remove(id: string): boolean {
        if (!this.cachedAudios.has(id)) { return false; }
        this.cachedAudios.delete(id);
        this.exportCache();
        return true;
    }

    public byId(id: string) {
        return this.cachedAudios.get(id);
    }

    public hasId(id: string) {
        return this.cachedAudios.has(id);
    }
}
