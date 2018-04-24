import { component, inject, initialize } from "tsdi";
import mkdirp = require("mkdirp-promise"); // tslint:disable-line
import { Connection } from "typeorm";
import * as Uuid from "uuid";
import { writeFile, unlink, readFile } from "async-file";
import { error, info } from "winston";
import { EventEmitter } from "events";

import { ServerConfig } from "../config";
import { CachedAudio, DatabaseUser, compareCachedAudio } from "../common";

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
        try {
            const obj = JSON.parse(await readFile(this.cachedAudioIndexFilePath));
            Object.keys(obj).forEach(key => this.cachedAudios.set(key, obj[key]));
        } catch (err) {
            if (err.code !== "ENOENT") { throw err; }
            info("No previous index of cached audios found.");
        }
    }

    private async exportCache() {
        const obj = {};
        this.cachedAudios.forEach((value, key) => obj[key] = value);
        await writeFile(this.cachedAudioIndexFilePath, JSON.stringify(obj));
    }

    @initialize
    private async initialize() {
        await this.createTmpDirectory();
        if (this.config.audioCacheAmount) { this.cacheAmount = this.config.audioCacheAmount; }
        this.importCache();
    }

    /**
     * Add an audio file to the list of cached audios.
     * @param filename Filename of the cached audio file.
     * @param user User that emitted the audio.
     * @param duration Duration of the audio.
     */
    public async add(filename: string, userId: string, duration: number) {
        const id = Uuid.v4();
        const user = await this.db.getRepository(DatabaseUser).findOne(userId);
        const cachedAudio: CachedAudio = new CachedAudio(filename, user, duration);
        this.cachedAudios.set(cachedAudio.id, cachedAudio);
        this.emit("cached-audio", cachedAudio);
        this.cleanUp();
        this.exportCache();
    }

    public get all() { return Array.from(this.cachedAudios.values()); }
    public get sorted() { return this.all.sort(compareCachedAudio); }

    private async cleanUp() {
        const prot = [];
        const list = this.sorted;
        await Promise.all(list.map(async cachedAudio => {
            if (cachedAudio.protected) { return; }
            if (this.cachedAudios.size <= this.cacheAmount) { return; }
            this.cachedAudios.delete(cachedAudio.id);
            try {
                await unlink(cachedAudio.file);
                await unlink(`${cachedAudio.file}.png`);
                this.emit("removed-cached-audio", cachedAudio);
                info(`Deleted cached audio file "${cachedAudio.file}" and "${cachedAudio.file}.png".`);
            } catch (err) {
                error("Error when cleaning up cached audios!", err);
            }
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

    /**
     * Protected the cached audio with the given id.
     * @param id Id of the audio to protect.
     * @return False when the id was invalid.
     */
    public protect(id: string): boolean {
        const cachedAudio = this.byId(id);
        if (!cachedAudio) { return false; }
        else {
            cachedAudio.protected = true;
            this.emit("protect-cached-audio", cachedAudio);
            this.exportCache();
            return true;
        }
    }
}
