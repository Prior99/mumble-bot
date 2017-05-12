/*
 * Imports
 */

import Samplerate from "node-samplerate";
import * as Winston from "winston";
import * as FS from "fs";
import { EventEmitter } from "events";
import * as FFMpeg from "fluent-ffmpeg";

const msInS = 1000;
const audioFreq = 48000;

/**
 * Handles playing back raw PCM audio soundfiles (WAV). Those need to be exactly
 * 44,100Hz and mono-channel. This class is used by Output and is not intended
 * to be used seperatly.
 */
export class Sound extends EventEmitter {
    public length: number;
    private plaing: boolean = false;
    private stream: any;
    private queue: any[] = [];
    private current: any = null;
    private ffmpeg: any;
    private timeout: number;
    private playing: boolean;

    /**
     * @constructor
     * @param {WritableStream} stream - Stream to write the audio data to.
      */
    constructor(stream) {
        super();
        this.stream = stream;
    }

    /**
     * Plays the file.
     * @param {string} filename - The filename of the file to be played.
     * @returns {undefined}
     */
    _play(filename) {
        let samplesTotal = 0;
        const startTime = Date.now();
        this._playbackStarted();
        this.ffmpeg = FFMpeg(filename)
            .format("s16le")
            .audioChannels(1)
            .audioFrequency(audioFreq);
        this.ffmpeg.stream().on("data", chunk => {
            samplesTotal += chunk.length / 2;
            this.stream.write(chunk);
        })
            .on("end", () => {
                const timeAlreadyTaken = Date.now() - startTime;
                const totalTime = (samplesTotal / audioFreq) * msInS;
                const waitTime = totalTime - timeAlreadyTaken;
                this.timeout = setTimeout(this._playbackStopped.bind(this), waitTime);
            });
    }

    /**
     * Clear the whole queue and stop current playback.
     * @returns {undefined}
     */
    clear() {
        this.queue = [];
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        if (this.ffmpeg) {
            this.ffmpeg.kill();
        }
        this._playbackStopped();
    }

    /**
     * When the playback started.
     * @returns {undefined}
     */
    _playbackStarted() {
        this.playing = true;
        this.emit("start");
    }

    /**
     * When the playback stopped.
     * @returns {undefined}
     */
    _playbackStopped() {
        this.playing = false;
        if (this.current) {
            this.emit("stop");
            const callback = this.current.callback;
            this.current = null;
            this._next();
            if (callback) {
                callback();
            }
        }
    }

    /**
     * Plays the next sound in the queue.
     * @returns {undefined}
     */
    _next() {
        if (!this.playing && this.queue.length !== 0) {
            this.current = this.queue.shift();
            this._play(this.current.file);
        }
    }

    /**
     * Enqueue a new workitem to play back when queue is processed.
     * @param {TODO} workitem - Workitem to enqueue containing the filename of the
     *                     soundfile.
     * @returns {undefined}
     */
    enqueue(workitem) {
        this.queue.push(workitem);
        if (!this.playing) {
            this._next();
        }
    }

    /**
     * Stop the sound submodule.
     * @return {undefined}
     */
    stop() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }
}
