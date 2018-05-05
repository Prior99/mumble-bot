import { error, info } from "winston";
import * as uuid from "uuid";
import { bind } from "decko";
import * as FFMpeg from "fluent-ffmpeg";
import * as Stream from "stream";
import { PassThrough as PassThroughStream } from "stream";
import { external, inject, initialize } from "tsdi";
import { User as MumbleUser } from "mumble";
import { ServerConfig } from "../../config";
import { User } from "../../common";
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
    private databaseUser: User;
    private speaking = false;
    private passthrough: PassThroughStream;
    private timeout: NodeJS.Timer;
    private speakStartTime: Date;
    private currentId: string;
    private encoder: any;

    /**
     * @constructor
     * @param user Mumble user to recognize the speech of.
     * @param databaseUser The user from the database.
     */
    constructor(user, databaseUser) {
        super();
        this.user = user;
        this.databaseUser = databaseUser;
    }

    @initialize
    protected initialize() {
        this.createNewRecordingFile();
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

    @bind private handleEncoderError(err: Error) {
        error(`Encoder for user ${this.user.name} crashed.`, this.encoder. err);
    }

    /**
     * Creates a new temporary record file.
     */
    private createNewRecordingFile = () => {
        this.currentId = uuid.v4();
        this.passthrough = new PassThroughStream();
        this.encoder = FFMpeg(this.passthrough)
            .inputOptions(
                "-f", "s16le",
                "-ar", String(audioFreq),
                "-ac", "1",
            )
            .on("error", this.handleEncoderError)
            .audioCodec("libmp3lame")
            .format("mp3")
            .save(`${this.config.tmpDir}/${this.currentId}`);
    }

    /**
     * When user stopped speaking.
     */
    private speechStopped() {
        this.speaking = false;
        this.passthrough.end();
        this.cache.add(
            this.currentId,
            this.databaseUser.id,
            (Date.now() - this.speakStartTime.getTime()) / msInS,
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
        this.passthrough.end();
        // Ignore error when killing encoder.
        this.encoder.removeListener("error", this.handleEncoderError);
        this.encoder.once("error", () => { return; });
        try {
            this.encoder.kill();
        } catch (err) {} // tslint:disable-line
        if (this.timeout) { clearTimeout(this.timeout); }
        info(`Input stopped for user ${this.user.name}`);
    }
}
