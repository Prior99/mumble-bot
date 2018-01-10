import { component, inject, initialize } from "tsdi";
import { Connection } from "typeorm";
import * as Uuid from "uuid";
import { writeFile, unlink, readFile } from "async-file";
import { error, info } from "winston";
import { EventEmitter } from "events";

import { CachedAudio, DatabaseUser, compareCachedAudio } from "../common";

import { Bot } from "./bot";

@component({ eager: true })
export class AudioCache extends EventEmitter {
    @inject private bot: Bot;
    @inject private db: Connection;

    public cachedAudios: Map<string, CachedAudio>;
    private cacheAmount = 4;

    private get cachedAudioIndexFilePath() { return `${this.bot.options.paths.tmp}/useraudio.json`; }

    private async importCache() {
        const obj = JSON.parse(await readFile(this.cachedAudioIndexFilePath));
        Object.keys(obj).forEach(key => this.cachedAudios.set(key, obj[key]));
    }

    private async exportCache() {
        const obj = {};
        this.cachedAudios.forEach((value, key) => obj[key] = value);
        await writeFile(this.cachedAudioIndexFilePath, JSON.stringify(obj));
    }

    @initialize
    private initialize() {
        const { options } = this.bot;
        if (options.audioCacheAmount) { this.cacheAmount = options.audioCacheAmount; }
        this.importCache();
    }

    /**
     * Add an audio file to the list of cached audios.
     * @param filename Filename of the cached audio file.
     * @param user User that emitted the audio.
     * @param duration Duration of the audio.
     */
    public async addCachedAudio(filename: string, userId: string, duration: number) {
        const id = Uuid.v4();
        const user = await this.db.getRepository(DatabaseUser).findOneById(userId);
        const cachedAudio: CachedAudio = new CachedAudio(filename, user, duration);
        this.cachedAudios.set(cachedAudio.id, cachedAudio);
        this.emit("cached-audio", cachedAudio);
        this.cleanUp();
        this.exportCache();
    }

    private async cleanUp() {
        const prot = [];
        const list = Array.from(this.cachedAudios.values()).sort(compareCachedAudio);
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
    public removeCachedAudioById(id: string): boolean {
        if (!this.cachedAudios.has(id)) { return false; }
        this.cachedAudios.delete(id);
        this.exportCache();
        return true;
    }
}
