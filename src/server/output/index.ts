import * as Winston from "winston";
import { Sound } from "./sound";
import * as Stream from "stream";
import { Bot } from "..";
import { MetaInformation, WorkItem } from "../types/output";

const PREBUFFER = 0.5;
const audioFreq = 48000;
const msInS = 1000;

/**
 * Audio output for the bot. This class handles the whole audio output,
 * including both TTS and sounds.
 */
export class Output extends Stream.Writable {
    public busy = false;
    public queue: WorkItem[] = [];
    private bot: Bot;
    private stream: any;
    private sound: Sound;
    private current: any;
    private bufferQueue: Buffer[] = [];
    private playbackAhead = 0;
    private stopped = false;
    private lastBufferShift: number;
    private timeout: NodeJS.Timer;
    /**
     * @param bot Bot this belongs to.
     */
    constructor(bot: Bot) {
        super();
        this.bot = bot;
        this.stream = bot.mumble.inputStream();
        this.sound = new Sound(this);
    }

    /**
     * Processes the buffer and keeps the stream to mumble filled.
     */
    private shiftBuffer() {
        if (this.stopped) {
            return;
        }
        if (this.lastBufferShift) {
            const timePassed = (Date.now() - this.lastBufferShift) / msInS;
            this.playbackAhead -= timePassed;
        }
        if (this.bufferQueue.length > 0) {
            const start = Date.now();
            if (this.playbackAhead < 0 && this.lastBufferShift) {
                Winston.warn("Buffer underflow.");
            }
            while (this.playbackAhead < PREBUFFER && this.bufferQueue.length > 0) {
                const b = this.bufferQueue.shift();
                const lengthOfBuffer = (b.length / 2) / audioFreq;
                this.playbackAhead += lengthOfBuffer;
                this.stream.write(b);
            }
            let waitFor;
            const overfilled = this.playbackAhead - PREBUFFER;
            if (overfilled > 0) {
                waitFor = msInS * overfilled;
            }
            else {
                waitFor = 100;
            }
            this.timeout = setTimeout(this.shiftBuffer.bind(this), waitFor);
            this.lastBufferShift = Date.now();
        }
        else {
            this.playbackAhead = 0;
            this.lastBufferShift = undefined;
            this.timeout = undefined;
        }
    }

    /**
     * Write something into this stream.
     * @param chunk Chunk to be written to the queue.
     * @param encoding Encoding of the cunk if any.
     * @param done Called when the data is shifted into the queue.
     */
    public _write(chunk: Buffer, encoding: string, done: () => void) {
        this.bufferQueue.push(chunk);
        if (!this.timeout) {
            this.shiftBuffer(); // Not currently processing queue? Sleeping? Wake up!
        }
        done();
    }

    /**
     * Clear the whole queue and stop current playback.
     */
    public clear() {
        this.queue = [];
        this.bufferQueue = [];
        this.sound.clear();
        this.emit("clear");
    }

    /**
     * Start processing the next item in the queue.
     */
    private next() {
        if (!this.busy && this.queue.length !== 0) {
            this.current = this.queue.shift();
            this.emit("change", this.queue);
            this.emit("dequeue");
            this.process();
        }
    }

    /**
     * Process the next item.
     */
    private process() {
        this.processStarted();
        this.sound.enqueue({
            file: this.current.file,
            callback: this.processStopped.bind(this),
            pitch: this.current.pitch
        });
    }

    /**
     * When processing the next item started.
     */
    private processStarted() {
        this.busy = true;
        this.emit("start", this.current);
    }

    /**
     * When processing stopped.
     */
    private processStopped() {
        const callback = this.current.callback;
        this.current = undefined;
        this.busy = false;
        this.emit("stop");
        if (callback) {
            callback();
        }
        this.next();
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
            this.enqueue({ file, meta, callback, time: new Date(), pitch });
        });
    }

    /**
     * Also enqueues sounds, but many at once (automically?)
     * @param filelist The files to be played.
     * @param pitch The pitch to which the audio should be transformed.
     * @param meta Metadata displayed in queue.
     */
    public playSounds(filelist: string[], meta: MetaInformation, pitch = 0) { // callback TODO?
        for (let i = 0; i < filelist.length; i++) {
            this.enqueue({
                file: filelist[i],
                meta,
                time: new Date(),
                pitch
            });
        }
    }

    /**
     * Enqueues a work item.
     * @param workitem The object to be enqueued.
     */
    private enqueue(workitem: WorkItem) {
        this.queue.push(workitem);
        this.emit("enqueue", workitem);
        this.emit("change", this.queue);
        if (!this.busy) {
            this.next();
        }
    }

    /**
     * Stop all timeouts and shutdown everything.
     */
    public stop() {
        this.stopped = true;
        this.clear();
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.sound.stop();
        this.stream.close();
        this.stream.end();
        Winston.info("Output stopped.");
    }
}
