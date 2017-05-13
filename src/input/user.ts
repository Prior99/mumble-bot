import Samplerate from "node-samplerate";
import * as Winston from "winston";
import { EventEmitter } from "events";
import * as FS from "fs";
import * as FFMpeg from "fluent-ffmpeg";
import * as Stream from "stream";
import { PassThrough as PassThroughStream } from "stream";
import { Bot } from "..";
import { writeUserStatsOnline, writeUserStatsSpeak } from "../database";

const TIMEOUT_THRESHOLD = 300;
const msInS = 1000;
const audioFreq = 48000;

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position) {
        position = position || 0;
        return this.lastIndexOf(searchString, position) === position;
    };
}

/**
 * This class belongs to the VoiceInput and handles the speech recognition for a
 * single user.
 */
export class VoiceInputUser extends Stream.Writable {
    private bot: Bot;
    private user: any;
    private databaseUser: any;
    private speaking: boolean = false;
    private connectTime: Date;
    private passthrough: PassThroughStream;
    private timeout: number;
    private speakStartTime: Date;
    private filename: string;
    private encoder: any;
    private started: boolean;
    /**
     * @constructor
     * @param {MumbleUser} user - Mumble user to recognize the speech of.
     * @param {DatabaseUser} databaseUser - The user from the database.
     * @param {Bot} bot - The bot instance this user belongs to.
     */
    constructor(user, databaseUser, bot) {
        super();
        this.user = user;
        this.bot = bot;
        this.databaseUser = databaseUser;
        this.createNewRecordingFile();
        this.connectTime = new Date();
        this.user.on("disconnect", this.onDisconnect.bind(this));
    }

    /**
     * Feed raw PCM audio data captured from mumble to this user.
     * @param {array} chunk - Buffer of raw PCM audio data.
     * @param {string} encoding - unused.
     * @param {function} done - callback.
     * @returns {undefined}
     */
    public _write(chunk: any, encoding?: string, done?: Function): boolean {
        if (!this.speaking) {
            this.speechStarted();
        }
        this.speechContinued(chunk);
        done();
        return true;
    }

    /**
     * Called when user disconnects.
     * Updates the stats.
     * @returns {undefined}
     */
    private onDisconnect() {
        writeUserStatsOnline(this.databaseUser, this.connectTime, new Date(), this.bot.database);
    }

    /**
     * Refreshes the timeout of silence after which the audio will be sliced into different records.
     * @returns {undefined}
     */
    private refreshTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(this.speechStopped.bind(this), TIMEOUT_THRESHOLD);
    }

    /**
     * When user started speaking.
     * @returns {undefined}
     */
    private speechStarted() {
        this.speaking = true;
        this.speakStartTime = new Date();
    }

    /**
     * Creates a new temporary record file.
     * @returns {undefined}
     */
    private createNewRecordingFile() {
        if (this.databaseUser.settings.record === true) {
            try {
                FS.mkdirSync("tmp");
            }
            catch (err) { /* Ignored */ }
            try {
                FS.mkdirSync("tmp/useraudio");
            }
            catch (err) { /* Ignored */ }
            try {
                FS.mkdirSync("tmp/useraudio/" + this.user.id);
            }
            catch (err) { /* Ignored */ }
            this.filename = "tmp/useraudio/" + this.user.id + "/" + Date.now() + ".mp3";
            this.passthrough = new PassThroughStream();
            this.encoder = FFMpeg(this.passthrough)
                .inputOptions(
                "-f", "s16le",
                "-ar", audioFreq,
                "-ac", "1"
                )
                .on("error", (err) => Winston.error("Encoder for user " + this.user.username + " crashed."))
                .audioCodec("libmp3lame")
                .save(this.filename);
        }
    }

    /**
     * When user stopped speaking.
     * @returns {undefined}
     */
    private speechStopped() {
        this.speaking = false;
        this.started = false;
        if (this.databaseUser.settings.record === true) {
            this.passthrough.end();
            this.bot.addCachedAudio(
                this.filename,
                this.databaseUser,
                (Date.now() - this.speakStartTime.getTime()) / msInS
            );
            this.createNewRecordingFile();
        }
        writeUserStatsSpeak(this.databaseUser, this.speakStartTime, new Date(), this.bot.database);
    }

    /**
     * When user continues speaking this method will be called,
     * the audio will be encoded and the timeout will be refreshed.
     * @param {Buffer} chunk - The user's speech buffer.
     * @returns {undefined}
     */
    private speechContinued(chunk) {
        if (this.databaseUser.settings.record === true) {
            this.passthrough.write(chunk);
        }
        this.refreshTimeout();
    }

    /**
     * Stop all timeouts and shutdown everything.
     * @return {undefined}
     */
    stop() {
        this.encoder.kill();
        this.end();
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        Winston.info("Input stopped for user " + this.user.name);
    }
}