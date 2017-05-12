/*
 * Imports
 */
import Input from "./input";
import Output from "./output";
import Winston from "winston";
import Api from "./rest-api";
import FS from "fs-promise";
import EventEmitter from "events";
import Permissions from "./permissions";
import VisualizeAudioFile from "./visualizer";

const AUDIO_CACHE_AMOUNT = 4;

/**
 * A callback without any parameters.
 * @callback VoidCallback
 */

/**
 * A user from the Mumble server. Refer to documentation of node-mumble.
 * @typedef {object} MumbleUser
 */

/**
 * This is the main class of the bot instanciated from the loader and holding all relevant data,
 * systems and connections.
 */
class Bot extends EventEmitter {
    /**
     * This is the constructor of the bot.
     * @constructor
     * @param {MumbleConnection} mumble - already set up mumble connection (MumbleClient)
     * @param {Config} options - Options read from the config.json
     * @param {Database} database - Started connection to database.
     */
    constructor(mumble, options, database) {
        super();
        this.options = options;
        this.mumble = mumble;
        this.database = database;
        this.cachedAudios = [];
        this._audioId = 0;

        this.permissions = new Permissions(database);

        this.api = new Api(this);

        this.output = new Output(this);
        if(options.audioCacheAmount) {
            this.audioCacheAmount = options.audioCacheAmount;
        }
        else {
            this.audioCacheAmount = AUDIO_CACHE_AMOUNT;
        }

        this._init();
    }
    /**
     * Register commands and listeners and load all addons.
     * @return {undefined}
     */
    async _init() {
        this.input = new Input(this);
    }

    /**
     * Returns only those users which have a unique id and are thous registered on
     * the mumble server.
     * @returns {undefined}
     */
    getRegisteredMumbleUsers() {
        const users = this.mumble.users();
        const result = [];
        for(const i in users) {
            if(users[i].id) {
                result.push(users[i]);
            }
        }
        return result;
    }

    /**
     * Instantly shutdown everything which could cause noises.
     * @return {undefined}
     */
    beQuiet() {
        this.output.clear();
    }

    /**
     * <b>Async</b> Gently shutdown the whole bot.
     * @return {undefined}
     */
    async shutdown() {
        try {
            this.beQuiet();
            await this.say("Goodbye.");
            this._deleteAllCachedAudio(0);
            await this.api.shutdown();
            this.output.stop();
            this.input.stop();
            this.emit("shutdown");
        }
        catch(err) {
            Winston.error("Error during shutdown:", err);
        }
    }

    /**
     * Will return whether the bot is busy speaking or listening to anyone.
     * @return {Boolean} - If the bot is busy speaking or listening
     */
    busy() {
        return this.output.busy || this.input.busy;
    }

    /**
     * Plays a sound in the mumble server.
     * @param {string} filename - Filename of the soundfile to play. Must be a mono-channel 48,000Hz WAV-File
     * @param {Object} meta - Metadata passed to the output module.
     * @return {undefined}
     */
    async playSound(filename, meta) {
        await this.output.playSound(filename, meta);
    }

    /**
     * Makes the bot join a specific channel in mumble.
     * @param {string} cname - Name of the channel to join.
     * @return {undefined}
     */
    join(cname) {
        try {
            const channel = this.mumble.channelByName(cname);
            if(!channel) {
                Winston.error("Channel \"" + cname + "\" is unknown.");
            }
            else {
                channel.join();
            }
        }
        catch(err) {
            Winston.error("Unable to join channel \"" + cname + "\":", err);
        }
    }

    /**
     * Add an audio file to the list of cached audios.
     * @param {string} filename - Filename of the cached audio file.
     * @param {DatabaseUser} user - User that emitted the audio.
     * @param {number} duration - Duration of the audio.
     * @return {undefined}
     */
    async addCachedAudio(filename, user, duration) {
        const obj = {
            file : filename,
            date : new Date(),
            user,
            id : this._audioId++,
            duration,
            protected : false
        };
        const height = 32;
        const samplesPerPixel = 400;
        const buffer = await VisualizeAudioFile(filename, height, samplesPerPixel);
        await FS.writeFile(filename + ".png", buffer);
        this.cachedAudios.push(obj);
        this.emit("cached-audio", obj);
        this._clearUpCachedAudio();
    }

    /**
     * A cached audio.
     * @typedef {object} CachedAudio
     * @property {string} file - The filename of the audio.
     * @property {date} date - The date the audio was recorded.
     * @property {DatabaseUser} user - The user from which the audio was recorded.
     * @property {number} id - The id of the cached audio.
     * @property {number} duration - The duration of the audio in seconds.
     * @property {boolean} protected - Whether the audio was protected by someone or not.
     */

    /**
     * Retrieve the cached audio by its id. Returns the audio when the id was valid
     * and null otherwise.
     * @param {number} id - Id of the audio to look up.
     * @return {CachedAudio} - The cached audio or null when the id was invalid.
     */
    getCachedAudioById(id) {
        id = +id;
        for(const key in this.cachedAudios) {
            if(this.cachedAudios.hasOwnProperty(key)) {
                const audio = this.cachedAudios[key];
                if(audio.id === id) {
                    return audio;
                }
            }
        }
        return null;
    }

    /**
     * Protected the cached audio with the given id.
     * @param {number} id - Id of the audio to protect.
     * @return {boolean} - False when the id was invalid.
     */
    protectCachedAudio(id) {
        const elem = this.getCachedAudioById(id);
        if(!elem) {
            return false;
        }
        else {
            elem.protected = true;
            this.emit("protect-cached-audio", elem);
            return true;
        }
    }

    /**
     * Removes the cached audio with the given id.
     * @param {number} id - Id of the audio to remove.
     * @return {boolean} - False when the id was invalid.
     */
    removeCachedAudioById(id) {
        const elem = this.getCachedAudioById(id);
        if(!elem) {
            return false;
        }
        else {
            this.removeCachedAudio(elem);
            return true;
        }
    }

    /**
     * Removes the cached audio by audio object.
     * @param {CachedAudio} audio - audio object to remove.
     * @return {boolean} - False when the id was invalid.
     */
    removeCachedAudio(audio) {
        const index = this.cachedAudios.indexOf(audio);
        if(index !== -1) {
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
     * @return {undefined}
     */
    _clearUpCachedAudio() {
        this._deleteAllCachedAudio(this.audioCacheAmount);
    }

    /**
     * Delete the specified amount of audios from the list of cached audios starting with the oldest
     * and skipping protected audios.
     * @param {number} amount - AMount of audios to remove.
     * @return {undefined}
     */
    _deleteAllCachedAudio(amount) {
        const prot = [];
        while(this.cachedAudios.length > amount) {
            const elem = this.cachedAudios.shift();
            if(elem.protected) {
                amount --;
                prot.push(elem);
            }
            else {
                try {
                    FS.unlinkSync(elem.file);
                    this.emit("removed-cached-audio", elem);
                    Winston.info("Deleted cached audio file " + elem.file + ".");
                }
                catch(err) {
                    Winston.error("Error when cleaning up cached audios!", err);
                }
            }
        }
        while(prot.length > 0) {
            this.cachedAudios.unshift(prot.pop());
        }
    }

    /**
     * Find all users in mumble which contain the supplied string in their name.
     * For example: ```bot.findUsers("merlin");``` will find "Merlin | LÖML | Mörrrlin".
     * This method is used in *certain* methods.
     * @param {string} namePart - Text to search for.
     * @return {undefined}
     */
    findUsers(namePart) {
        namePart = namePart.toLowerCase();
        const users = this.mumble.users();
        const found = [];
        for(const key in users) {
            if(users.hasOwnProperty(key)) {
                const user = users[key];
                if(user.name.toLowerCase().indexOf(namePart) !== -1) {
                    found.push(user);
                }
            }
        }
        return found;
    }
}

export default Bot;
