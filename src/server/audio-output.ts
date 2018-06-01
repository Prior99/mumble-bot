import { info, error } from "winston";
import { Connection } from "typeorm";
import { Connection as MumbleConnection, InputStream as MumbleInputStream } from "mumble";
import * as FFMpeg from "fluent-ffmpeg";
import * as Sox from "sox-audio";
import { inject, component, initialize, destroy } from "tsdi";
import { stat } from "fs-extra";
import { EventEmitter } from "events";
import { QueueItem, Playlist } from "../common";
import { ServerConfig } from "../config";

const audioFreq = 48000;
const msInS = 1000;

interface PlaybackInfo {
    filename: string;
    pitch: number;
}

/**
 * Audio output for the bot. This class handles the whole audio output,
 * including both TTS and sounds.
 */
@component("AudioOutput")
export class AudioOutput extends EventEmitter {
    @inject("MumbleConnection") private mumble: MumbleConnection;
    @inject private config: ServerConfig;
    @inject private db: Connection;

    public busy = false;
    public queue: QueueItem[] = [];

    private mumbleStream: MumbleInputStream;
    private stopped = false;
    private ffmpeg: any;
    private passThrough: Stream.PassThrough;
    private sox: Sox;

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
    private play({ filename, pitch }: PlaybackInfo): Promise<undefined> {
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
                this.ffmpeg.on("error", (err) => {
                        error(`Error decoding file ${filename}`, err);
                        reject();
                    });
                this.sox = new Sox()
                    .input(this.ffmpeg.stream())
                    .inputSampleRate("48k")
                    .inputBits(16)
                    .inputChannels(1)
                    .inputFileType("raw")
                    .inputEncoding("signed");
                this.passThrough = new Stream.PassThrough();
                const output = this.sox.output(this.passThrough)
                    .outputSampleRate("48k")
                    .outputEncoding("signed")
                    .outputBits(16)
                    .outputChannels(1)
                    .outputFileType("raw");
                output.addEffect("pitch", [pitch]);
                this.sox.on("error", (err) => {
                        error(`Error processing file "${filename}" with sox.`, err);
                        reject();
                    });
                this.sox.run();
                this.passThrough
                    .on("data", (chunk: Buffer) => {
                        samplesTotal += chunk.length / 2;
                        this.mumbleStream.write(chunk);
                    })
                    .on("end", () => {
                        if (this.stopped) { return; }
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
     * Clear the whole queue and stop current playback.
     */
    public clear() {
        if (this.transcodeTimeout) { clearTimeout(this.transcodeTimeout); }
        if (this.ffmpeg) { this.ffmpeg.kill(); }
        this.queue = [];
        this.busy = false;
        this.mumbleStream.close();
        if (this.passThrough) {
            this.passThrough.destroy();
        }
        this.mumbleStream = this.mumble.inputStream();
        this.emit("clear");
    }

    private async playbackInfos(queueItem: QueueItem): Promise<PlaybackInfo[]> {
        switch (queueItem.type) {
            case "sound":
                return [
                    {
                        filename: `${this.config.soundsDir}/${queueItem.sound.id}`,
                        pitch: queueItem.pitch,
                    },
                ];
            case "cached audio":
                return [
                    {
                        filename: `${this.config.tmpDir}/${queueItem.cachedAudio.id}`,
                        pitch: queueItem.pitch,
                    },
                ];
            case "playlist":
                const playlist = await this.db.getRepository(Playlist).createQueryBuilder("playlist")
                    .where("playlist.id = :id", { id: queueItem.playlist.id })
                    .leftJoinAndSelect("playlist.entries", "entry")
                    .leftJoinAndSelect("entry.sound", "sound")
                    .orderBy("entry.position", "ASC")
                    .getOne();
                return playlist.entries.map(({ sound, pitch }) => ({
                    filename: `${this.config.soundsDir}/${sound.id}`,
                    pitch,
                }));
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
            for (let playbackInfo of await this.playbackInfos(current)) {
                await this.play(playbackInfo);
            }
            this.emit("shift", current);
        }
        this.busy = false;
    }

    /**
     * Enqueue a new sound, playlist or cached audio.
     *
     * @param queueItem The item to enqueue.
     */
    public enqueue(queueItem: QueueItem) {
        return new Promise((callback, reject) => {
            this.queue.push(queueItem);
            this.emit("push", queueItem);
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
        if (this.passThrough) { this.passThrough.end(); }
        if (this.ffmpeg) {
            try {
                this.ffmpeg.kill();
            } catch (err) {} //tslint:disable-line
        }
        if (this.transcodeTimeout) {
            clearTimeout(this.transcodeTimeout);
        }
        this.clear();
        info("Output stopped.");
    }
}
