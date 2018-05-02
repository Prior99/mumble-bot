import { warn, info, error } from "winston";
import { Connection } from "typeorm";
import { Connection as MumbleConnection, InputStream as MumbleInputStream } from "mumble";
import * as Stream from "stream";
import * as FFMpeg from "fluent-ffmpeg";
import * as Sox from "sox-audio";
import { inject, component, initialize, destroy } from "tsdi";
import { stat } from "fs-extra";
import { EventEmitter } from "events";
import { QueueItem, Playlist } from "../common";
import { ServerConfig } from "../config";

const PREBUFFER = 0.5;
const audioFreq = 48000;
const msInS = 1000;

/**
 * Audio output for the bot. This class handles the whole audio output,
 * including both TTS and sounds.
 */
@component
export class AudioOutput extends EventEmitter {
    @inject private mumble: MumbleConnection;
    @inject private config: ServerConfig;
    @inject private db: Connection;

    public busy = false;
    public queue: QueueItem[] = [];

    private mumbleStream: MumbleInputStream;
    private stopped = false;
    private bufferQueue: Buffer[] = [];
    private playbackAhead = 0;
    private lastBufferShift: number;
    private ffmpeg: any;

    private pcmTimeout: NodeJS.Timer;
    private transcodeTimeout: NodeJS.Timer;

    @initialize
    protected initialize() {
        this.mumbleStream = this.mumble.inputStream();
    }

    /**
     * Plays the file.
     * @param filename The filename of the file to be played.
     * @param pitch The pitch to which the audio should be transformed.
     */
    private play(filename: string, pitch = 0): Promise<undefined> {
        return new Promise(async (resolve, reject) => {
            let samplesTotal = 0;
            const startTime = Date.now();
            try {
                const result = await stat(filename);
                if (!result.isFile()) {
                    error(`File ${filename} is not a regular file.`);
                    return reject();
                }
                this.ffmpeg = FFMpeg(filename)
                    .format("s16le")
                    .audioChannels(1)
                    .audioFrequency(audioFreq);
                this.ffmpeg
                    .on("error", (err) => {
                        error(`Error decoding file ${filename}`, err);
                        reject();
                    });
                const transform = new Sox()
                    .input(this.ffmpeg.stream())
                    .inputSampleRate("48k")
                    .inputBits(16)
                    .inputChannels(1)
                    .inputFileType("raw")
                    .inputEncoding("signed");
                const passThrough = new Stream.PassThrough();
                const output = transform.output(passThrough)
                    .outputSampleRate("48k")
                    .outputEncoding("signed")
                    .outputBits(16)
                    .outputChannels(1)
                    .outputFileType("raw");
                output.addEffect("pitch", [pitch]);
                transform
                    .on("error", (err) => {
                        error(`Error transforming file ${filename}`, err);
                        reject();
                    });
                transform.run();
                passThrough
                    .on("data", (chunk: Buffer) => {
                        samplesTotal += chunk.length / 2;
                        this.writePcm(chunk);
                    })
                    .on("end", () => {
                        const timeAlreadyTaken = Date.now() - startTime;
                        const totalTime = (samplesTotal / audioFreq) * msInS;
                        const waitTime = totalTime - timeAlreadyTaken;
                        this.transcodeTimeout = global.setTimeout(resolve, waitTime);
                    });
            } catch (err) {
                error(`Error reading file ${filename}`, err);
                reject();
            }
        });
    }

    /**
     * Processes the buffer and keeps the stream to mumble filled.
     */
    private shiftBuffer() {
        // Here be dragons.
        if (this.stopped) { return; }
        if (this.lastBufferShift) {
            const timePassed = (Date.now() - this.lastBufferShift) / msInS;
            this.playbackAhead -= timePassed;
        }
        if (this.bufferQueue.length > 0) {
            if (this.playbackAhead < 0 && this.lastBufferShift) {
                warn("Buffer underflow.");
            }
            while (this.playbackAhead < PREBUFFER && this.bufferQueue.length > 0) {
                const b = this.bufferQueue.shift();
                const lengthOfBuffer = (b.length / 2) / audioFreq;
                this.playbackAhead += lengthOfBuffer;
                this.mumbleStream.write(b);
            }
            const overfilled = this.playbackAhead - PREBUFFER;
            let waitFor = overfilled > 0 ? msInS * overfilled : 100;
            this.pcmTimeout = global.setTimeout(this.shiftBuffer.bind(this), waitFor);
            this.lastBufferShift = Date.now();
            return;
        }
        this.playbackAhead = 0;
        this.lastBufferShift = undefined;
        this.pcmTimeout = undefined;
    }

    /**
     * Write something into this stream.
     * @param chunk Chunk to be written to the queue.
     * @param encoding Encoding of the cunk if any.
     * @param done Called when the data is shifted into the queue.
     */
    public writePcm(chunk: Buffer) {
        this.bufferQueue.push(chunk);
        // Not currently processing queue? Sleeping? Wake up!
        if (!this.pcmTimeout) {
            this.shiftBuffer();
        }
    }

    /**
     * Clear the whole queue and stop current playback.
     */
    public clear() {
        if (this.pcmTimeout) { clearTimeout(this.pcmTimeout); }
        if (this.transcodeTimeout) { clearTimeout(this.transcodeTimeout); }
        if (this.ffmpeg) { this.ffmpeg.kill(); }
        this.queue = [];
        this.bufferQueue = [];
        this.emit("clear");
    }

    private async getFiles(queueItem: QueueItem) {
        switch (queueItem.type) {
            case "sound":
                return [`${this.config.soundsDir}/${queueItem.sound.id}`];
            case "cached audio":
                return [`${this.config.tmpDir}/${queueItem.cachedAudio.id}`];
            case "playlist":
                const playlist = await this.db.getRepository(Playlist).createQueryBuilder("playlist")
                    .where("playlist.id = :id", { id: queueItem.playlist.id })
                    .leftJoinAndSelect("playlist.entries", "entry")
                    .leftJoinAndSelect("entry.sound", "sound")
                    .orderBy("entry.position", "ASC")
                    .getOne();
                return playlist.entries.map(entry => `${this.config.soundsDir}/${entry.sound.id}`);
            default:
                return [];
        }
    }

    /**
     * Start processing the next item in the queue.
     */
    private async next() {
        if (this.busy) { return; }
        this.busy = true;
        while (this.queue.length > 0 && !this.stopped) {
            const current = this.queue.shift();
            for (let file of await this.getFiles(current)) {
                await this.play(file, current.pitch);
            }
        }
        this.busy = false;
        this.emit("dequeue");
        this.emit("change", this.queue);
    }

    /**
     * Enqueue a new sound, playlist or cached audio.
     *
     * @param queueItem The item to enqueue.
     */
    public enqueue(queueItem: QueueItem) {
        return new Promise((callback, reject) => {
            this.queue.push(queueItem);
            this.emit("enqueue", queueItem);
            this.emit("change", this.queue);
            if (!this.busy) {
                this.next();
            }
        });
    }

    /**
     * Stop playback and shutdown everything.
     */
    @destroy
    public stop() {
        this.stopped = true;
        this.mumbleStream.close();
        this.mumbleStream.end();
        this.clear();
        info("Output stopped.");
    }
}
