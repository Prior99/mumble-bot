import { warn, info, error } from "winston";
import { Connection as MumbleConnection, InputStream as MumbleInputStream } from "mumble";
import * as Stream from "stream";
import * as FFMpeg from "fluent-ffmpeg";
import * as Sox from "sox-audio";
import { inject, component, initialize } from "tsdi";
import { stat } from "async-file";
import { EventEmitter } from "events";

import { MetaInformation, WorkItem } from "../common";

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

    public busy = false;
    public workItemQueue: WorkItem[] = [];

    private currentWorkItem: WorkItem;
    private mumbleStream: MumbleInputStream;
    private stopped = false;
    private bufferQueue: Buffer[] = [];
    private playbackAhead = 0;
    private lastBufferShift: number;
    private ffmpeg: any;

    private pcmTimeout: NodeJS.Timer;
    private transcodeTimeout: NodeJS.Timer;

    @initialize
    private initialize() {
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
        if (this.stopped) { return; }
        if (this.lastBufferShift) {
            const timePassed = (Date.now() - this.lastBufferShift) / msInS;
            this.playbackAhead -= timePassed;
        }
        if (this.bufferQueue.length > 0) {
            const start = Date.now();
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
        this.workItemQueue = [];
        this.bufferQueue = [];
        this.emit("clear");
    }

    /**
     * Start processing the next item in the queue.
     */
    private async next() {
        if (this.busy) { return; }
        this.busy = true;
        while (this.workItemQueue.length > 0 && !this.stopped) {
            this.currentWorkItem = this.workItemQueue.shift();
            this.emit("start", this.currentWorkItem);
            const { file, pitch, callback } = this.currentWorkItem;
            await this.play(file, pitch);
            this.emit("stop");
            callback();
        }
        this.currentWorkItem = undefined;
        this.busy = false;
        this.emit("dequeue");
        this.emit("change", this.workItemQueue);
    }

    /**
     * Queue playing back a soundfile. The soundfile needs to be exactly: Raw PCM
     * audio data (*.wav is fine), 44,100Hz and mono-channel.
     * @param file Name of the soundfile to play.
     * @param meta Metadata displayed in queue.
     * @param pitch The pitch to which the audio should be transformed.
     * @returns Resolved once the sound has finished playing.
     */
    public playSound(file: string, meta: MetaInformation, pitch = 0): Promise<{}> {
        return new Promise((callback, reject) => {
            const workItem = { file, meta, callback, time: new Date(), pitch };
            this.workItemQueue.push(workItem);
            this.emit("enqueue", workItem);
            this.emit("change", this.workItemQueue);
            if (!this.busy) {
                this.next();
            }
        });
    }

    /**
     * Also enqueues sounds, but many at once (automically?)
     * @param filelist The files to be played.
     * @param pitch The pitch to which the audio should be transformed.
     * @param meta Metadata displayed in queue.
     */
    public playSounds(filelist: string[], meta: MetaInformation, pitch = 0) {
        filelist.forEach(file => this.playSound(file, meta, pitch));
    }

    /**
     * Stop playback and shutdown everything.
     */
    public stop() {
        this.stopped = true;
        this.mumbleStream.close();
        this.mumbleStream.end();
        info("Output stopped.");
    }
}
