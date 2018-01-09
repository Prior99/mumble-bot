import { VoiceInput } from "./input";
import { Output } from "./output";
import * as Winston from "winston";
import { Connection } from "mumble";
import { Api } from "./rest-api";
import { writeFile, unlink, readFile } from "async-file";
import { EventEmitter } from "events";
import { Permissions } from "./permissions";
import { connectDatabase } from "./database";
import { CachedAudio } from "./models";
import { MetaInformation } from "./types/output";

const AUDIO_CACHE_AMOUNT = 4;

/**
 * This is the main class of the bot instanciated from the loader and holding all relevant data,
 * systems and connections.
 */
export class Bot extends EventEmitter {
    public options: any;
    public database: any;
    public mumble: Connection;
    public cachedAudios: CachedAudio[];
    public audioCacheAmount: number;
    public output: Output;
    public permissions: Permissions;
    private audioId = 0;
    private input: VoiceInput;
    private api: Api;

    /**
     * This is the constructor of the bot.
     * @constructor
     * @param mumble already set up mumble connection (MumbleClient)
     * @param options Options read from the config.json
     * @param database Started connection to database.
     */
    constructor(mumble, options, database) {
        super();
        this.options = options;
        this.mumble = mumble;
        this.cachedAudios = [];
        this.database = database;

        this.permissions = new Permissions(database);

        this.api = new Api(this);

        this.output = new Output(this);
        if (options.audioCacheAmount) {
            this.audioCacheAmount = options.audioCacheAmount;
        }
        else {
            this.audioCacheAmount = AUDIO_CACHE_AMOUNT;
        }

        this.init();
    }

    private async init() {
        this.input = new VoiceInput(this);
        try {
            this.cachedAudios = JSON.parse(await readFile(this.cachedAudioIndexFilePath));
            this.audioId = this.cachedAudios.reduce((result, cached) => cached.id > result ? cached.id : result, 0) + 1;
        } catch (err) {
            Winston.error("Failed to load cached audios from index file.", err);
            this.cachedAudios = [];
        }
    }

    /**
     * Returns only those users which have a unique id and are thous registered on
     * the mumble server.
     */
    public getRegisteredMumbleUsers() {
        return this.mumble.users().filter(user => typeof user.id !== "undefined");
    }

    /**
     * Instantly shutdown everything which could cause noises.
     */
    public beQuiet() {
        this.output.clear();
    }

    /**
     * Gently shutdown the whole bot.
     */
    public async shutdown() {
        try {
            this.beQuiet();
            await this.api.shutdown();
            this.output.stop();
            this.input.stop();
            this.emit("shutdown");
        }
        catch (err) {
            Winston.error("Error during shutdown:", err);
        }
    }

    /**
     * Will return whether the bot is busy speaking or listening to anyone.
     * @return If the bot is busy speaking or listening
     */
    public busy(): boolean {
        return this.output.busy;
    }

    /**
     * Plays a sound in the mumble server.
     * @param filename Filename of the soundfile to play. Must be a mono-channel 48,000Hz WAV-File
     * @param meta Metadata passed to the output module.
     * @param pitch The pitch to which the audio should be transformed.
     */
    public async playSound(filename: string, meta: MetaInformation, pitch = 0): Promise<void> {
        await this.output.playSound(filename, meta, pitch);
    }

    /**
     * Makes the bot join a specific channel in mumble.
     * @param cname Name of the channel to join.
     */
    public join(cname: string) {
        try {
            const channel = this.mumble.channelByName(cname);
            if (!channel) {
                Winston.error(`Channel "${cname}" is unknown.`);
            }
            else {
                channel.join();
            }
        }
        catch (err) {
            Winston.error(`Unable to join channel "${cname}":`, err);
        }
    }

    /**
     * Add an audio file to the list of cached audios.
     * @param filename Filename of the cached audio file.
     * @param user User that emitted the audio.
     * @param duration Duration of the audio.
     */
    public addCachedAudio(filename: string, user: number, duration: number) {
        const obj = {
            file: filename,
            date: new Date(),
            user,
            id: this.audioId++,
            duration,
            protected: false
        };
        this.cachedAudios.push(obj);
        this.emit("cached-audio", obj);
        this.clearUpCachedAudio();
        this.persistCachedAudios();
    }

    /**
     * Retrieve the cached audio by its id. Returns the audio when the id was valid
     * and null otherwise.
     * @param id Id of the audio to look up.
     * @return The cached audio or null when the id was invalid.
     */
    public getCachedAudioById(id: string): CachedAudio {
        return this.cachedAudios.find(audio => audio.id === id);
    }

    /**
     * Protected the cached audio with the given id.
     * @param id Id of the audio to protect.
     * @return False when the id was invalid.
     */
    public protectCachedAudio(id: string): boolean {
        const elem = this.getCachedAudioById(id);
        if (!elem) {
            return false;
        }
        else {
            elem.protected = true;
            this.emit("protect-cached-audio", elem);
            this.persistCachedAudios();
            return true;
        }
    }

    /**
     * Removes the cached audio with the given id.
     * @param id Id of the audio to remove.
     * @return False when the id was invalid.
     */
    public removeCachedAudioById(id: string): boolean {
        const elem = this.getCachedAudioById(id);
        if (!elem) {
            return false;
        }
        else {
            this.removeCachedAudio(elem);
            this.persistCachedAudios();
            return true;
        }
    }

    private get cachedAudioIndexFilePath() {
        return `${this.options.paths.tmp}/useraudio.json`;
    }

    private async persistCachedAudios() {
        await writeFile(this.cachedAudioIndexFilePath, JSON.stringify(this.cachedAudios));
    }

    /**
     * Removes the cached audio by audio object.
     * @param audio audio object to remove.
     * @return False when the id was invalid.
     */
    public removeCachedAudio(audio: CachedAudio): boolean {
        const index = this.cachedAudios.indexOf(audio);
        if (index !== -1) {
            this.cachedAudios.splice(index, 1);
            this.emit("removed-cached-audio", audio);
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Clears up the list of cached audios and keeps it to the specified maximum size.
     */
    private clearUpCachedAudio() {
        this.deleteAllCachedAudio(this.audioCacheAmount);
    }

    /**
     * Delete the specified amount of audios from the list of cached audios starting with the oldest
     * and skipping protected audios.
     * @param amount Amount of audios to remove.
     */
    private async deleteAllCachedAudio(amount): Promise<void> {
        const prot = [];
        while (this.cachedAudios.length > amount) {
            const elem = this.cachedAudios.shift();
            if (elem.protected) {
                amount--;
                prot.push(elem);
            }
            else {
                try {
                    await unlink(elem.file);
                    await unlink(`${elem.file}.png`);
                    this.emit("removed-cached-audio", elem);
                    Winston.info(`Deleted cached audio file "${elem.file}" and "${elem.file}.png".`);
                }
                catch (err) {
                    Winston.error("Error when cleaning up cached audios!", err);
                }
            }
        }
        while (prot.length > 0) {
            this.cachedAudios.unshift(prot.pop());
        }
    }
}