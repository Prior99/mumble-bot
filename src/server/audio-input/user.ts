import Samplerate from "node-samplerate";
import * as Winston from "winston";
import { EventEmitter } from "events";
import mkdirp = require("mkdirp-promise"); // tslint:disable-line
import * as FFMpeg from "fluent-ffmpeg";
import * as Stream from "stream";
import { PassThrough as PassThroughStream } from "stream";
import { external, inject } from "tsdi";
import { User as MumbleUser } from "mumble";

import { ServerConfig } from "../../config";
import { DatabaseUser } from "../../common";
import { AudioCache } from "..";

const TIMEOUT_THRESHOLD = 300;
const msInS = 1000;
const audioFreq = 48000;

/**
 * This class belongs to the VoiceInput and handles the speech recognition for a
 * single user.
 */
@external
export class VoiceInputUser extends Stream.Writable {
    @inject private config: ServerConfig;
    @inject private cache: AudioCache;

    private user: MumbleUser;
    private databaseUser: DatabaseUser;
    private speaking = false;
    private connectTime: Date;
    private passthrough: PassThroughStream;
    private timeout: NodeJS.Timer;
    private speakStartTime: Date;
    private filename: string;
    private encoder: any;
    private started: boolean;

    /**
     * @constructor
     * @param user Mumble user to recognize the speech of.
     * @param databaseUser The user from the database.
     */
    constructor(user, databaseUser) {
        super();
        this.user = user;
        this.databaseUser = databaseUser;
        this.createNewRecordingFile();
        this.connectTime = new Date();
    }

    private get path() {
        return `${this.config.tmpDir}/useraudio/${this.user.id}`;
    }

    /**
     * Has to be called from outside, before the stream is connected.
     */
    public async init() {
        await mkdirp(this.path);
    }

    /**
     * Feed raw PCM audio data captured from mumble to this user.
     * @param chunk Buffer of raw PCM audio data.
     * @param encoding unused.
     * @param done callback.
     */
    public _write(chunk: Buffer, encoding?: string, done?: Function): boolean {
        if (!this.speaking) {
            this.speechStarted();
        }
        this.speechContinued(chunk);
        done();
        return true;
    }

    /**
     * Refreshes the timeout of silence after which the audio will be sliced into different records.
     * @returns {undefined}
     */
    private refreshTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = global.setTimeout(this.speechStopped.bind(this), TIMEOUT_THRESHOLD);
    }

    /**
     * When user started speaking.
     */
    private speechStarted() {
        this.speaking = true;
        this.speakStartTime = new Date();
    }

    /**
     * Creates a new temporary record file.
     */
    private createNewRecordingFile = () => {
        this.filename = `${this.path}/${Date.now()}.mp3`;
        this.passthrough = new PassThroughStream();
        this.encoder = FFMpeg(this.passthrough)
        .inputOptions(
            "-f", "s16le",
            "-ar", audioFreq,
            "-ac", "1"
        )
        .on("error", (err) => Winston.error(`Encoder for user ${this.user.name} crashed.`, err))
        .audioCodec("libmp3lame")
        .save(this.filename);
    }

    /**
     * When user stopped speaking.
     */
    private speechStopped() {
        this.speaking = false;
        this.started = false;
        this.passthrough.end();
        this.cache.add(
            this.filename,
            this.databaseUser.id,
            (Date.now() - this.speakStartTime.getTime()) / msInS
        );
        this.createNewRecordingFile();
    }

    /**
     * When user continues speaking this method will be called,
     * the audio will be encoded and the timeout will be refreshed.
     * @param chunk - The user's speech buffer.
     */
    private speechContinued(chunk: Buffer) {
        this.passthrough.write(chunk);
        this.refreshTimeout();
    }

    /**
     * Stop all timeouts and shutdown everything.
     */
    public stop() {
        this.encoder.kill();
        this.end();
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        Winston.info(`Input stopped for user ${this.user.name}`);
    }
}
