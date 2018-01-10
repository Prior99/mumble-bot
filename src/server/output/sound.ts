import Samplerate from "node-samplerate";
import * as Winston from "winston";
import { stat } from "async-file";
import { EventEmitter } from "events";
import * as FFMpeg from "fluent-ffmpeg";
import * as Sox from "sox-audio";
import { PassThrough as PassThroughStream } from "stream";

const msInS = 1000;
const audioFreq = 48000;

/**
 * Handles playing back raw PCM audio soundfiles (WAV). Those need to be exactly
 * 44,100Hz and mono-channel. This class is used by Output and is not intended
 * to be used seperatly.
 */
export class Sound extends EventEmitter {
    public length: number;
    private plaing = false;
    private stream: any;
    private queue: any[] = [];
    private current: any;
    private ffmpeg: any;
    private timeout: NodeJS.Timer;
    private playing: boolean;

    /**
     * @constructor
     * @param stream Stream to write the audio data to.
     */
    constructor(stream: NodeJS.WritableStream) {
        super();
        this.stream = stream;
    }

    /**
     * Plays the file.
     * @param filename The filename of the file to be played.
     * @param pitch The pitch to which the audio should be transformed.
     */
    private async play(filename: string, pitch = 0) {
        let samplesTotal = 0;
        const startTime = Date.now();
        this.playbackStarted();
        try {
            const result = await stat(filename);
            if (!result.isFile()) {
                Winston.error(`File ${filename} is not a regular file`);
                this.playbackStopped();
                return;
            }
            this.ffmpeg = FFMpeg(filename)
                .format("s16le")
                .audioChannels(1)
                .audioFrequency(audioFreq);
            this.ffmpeg.on("error", (err) => {
                Winston.error(`Error decoding file ${filename}`, err);
                this.playbackStopped();
            });
            const transform = new Sox()
                .input(this.ffmpeg.stream())
                .inputSampleRate("48k")
                .inputBits(16)
                .inputChannels(1)
                .inputFileType("raw")
                .inputEncoding("signed");
            const ptStream = new PassThroughStream();
            const output = transform.output(ptStream)
                .outputSampleRate("48k")
                .outputEncoding("signed")
                .outputBits(16)
                .outputChannels(1)
                .outputFileType("raw");
            output.addEffect("pitch", [pitch]);
            transform.on("error", (err) => {
                Winston.error(`Error transforming file ${filename}`, err);
                this.playbackStopped();
            });
            transform.run();
            ptStream.on("data", chunk => {
                samplesTotal += chunk.length / 2;
                this.stream.write(chunk);
            })
            .on("end", () => {
                const timeAlreadyTaken = Date.now() - startTime;
                const totalTime = (samplesTotal / audioFreq) * msInS;
                const waitTime = totalTime - timeAlreadyTaken;
                this.timeout = setTimeout(this.playbackStopped.bind(this), waitTime);
            });
        } catch (err) {
            Winston.error(`Error reading file ${filename}`, err);
            this.playbackStopped();
        }
    }

    /**
     * Clear the whole queue and stop current playback.
     */
    public clear() {
        this.queue = [];
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
        if (this.ffmpeg) {
            this.ffmpeg.kill();
        }
        this.playbackStopped();
    }

    /**
     * When the playback started.
     */
    private playbackStarted() {
        this.playing = true;
        this.emit("start");
    }

    /**
     * When the playback stopped.
     */
    private playbackStopped() {
        this.playing = false;
        if (this.current) {
            this.emit("stop");
            const callback = this.current.callback;
            this.current = undefined;
            this.next();
            if (callback) {
                callback();
            }
        }
    }

    /**
     * Plays the next sound in the queue.
     * @returns {undefined}
     */
    private next() {
        if (!this.playing && this.queue.length !== 0) {
            this.current = this.queue.shift();
            this.play(this.current.file, this.current.pitch);
        }
    }

    /**
     * Enqueue a new workitem to play back when queue is processed.
     * @param {TODO} workitem - Workitem to enqueue containing the filename of the
     *                     soundfile.
     * @returns {undefined}
     */
    public enqueue(workitem) {
        this.queue.push(workitem);
        if (!this.playing) {
            this.next();
        }
    }

    /**
     * Stop the sound submodule.
     */
    public stop() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }
}
