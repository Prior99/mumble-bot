import * as Winston from "winston";
import { Sound } from "./sound";
import * as Stream from "stream";
import { Bot } from "..";

const PREBUFFER = 0.5;
const audioFreq = 48000;
const msInS = 1000;

/**
 * Audio output for the bot. This class handles the whole audio output,
 * including both TTS and sounds.
 */
export class Output extends Stream.Writable {
    public busy: boolean = false;
    public queue: Sound[] = [];
    private bot: Bot;
    private stream: any;
    private sound: Sound;
    private current: any;
    private bufferQueue: Sound[] = [];
    private playbackAhead: number = 0;
    private stopped: boolean = false;
    private lastBufferShift: number;
    private timeout: number;
    /**
     * @constructor
     * @param {Bot} bot - Bot this belongs to.
     */
    constructor(bot: Bot) {
        super(); // TODO
        this.bot = bot;
        this.stream = bot.mumble.inputStream();
        this.sound = new Sound(this);
        this.current = null;
    }
    //var PREBUFFER = 0.5; TODO see above

    /**
     * Processes the buffer and keeps the stream to mumble filled.
     * @returns {undefined}
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
            this.lastBufferShift = null;
            this.timeout = null;
        }
    }

    /**
     * Write something into this stream.
     * @param {buffer} chunk - Chunk to be written to the queue.
     * @param {string} encoding - Encoding of the cunk if any.
     * @param {VoidCallback} done - Called when the data is shifted into the queue.
     * @returns {undefined}
     */
    public _write(chunk, encoding, done) {
        this.bufferQueue.push(chunk);
        if (!this.timeout) {
            this.shiftBuffer(); //Not currently processing queue? Sleeping? Wake up!
        }
        done();
    }

    /**
     * Clear the whole queue and stop current playback.
     * @returns {undefined}
     */
    clear() {
        this.queue = [];
        this.bufferQueue = [];
        this.sound.clear();
        this.emit("clear");
    }

    /**
     * Start processing the next item in the queue.
     * @returns {undefined}
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
     * @returns {undefined}
     */
    private process() {
        this.processStarted();
        this.sound.enqueue({
            file: this.current.file,
            callback: this.processStopped.bind(this)
        });
    }

    /**
     * When processing the next item started.
     * @returns {undefined}
     */
    private processStarted() {
        this.busy = true;
        this.emit("start", this.current);
    }

    /**
     * When processing stopped.
     * @returns {undefined}
     */
    private processStopped() {
        const callback = this.current.callback;
        this.current = null;
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
     * @param {string} file - Name of the soundfile to play.
     * @param {Object} meta - Metadata displayed in queue.
     * @returns {Promise} - Resolved once the sound has finished playing.
     */
    playSound(file, meta) {
        return new Promise((resolve, reject) => {
            this.enqueue({
                file,
                meta,
                callback() {
                    resolve();
                }
            });
        });
    }

    /**
     * Also enqueues sounds, but many at once (automically?)
     * @param {string[]} filelist - The files to be played.
     * @param {Object} meta - Metadata displayed in queue.
     * @returns {undefined}
     */
    playSounds(filelist, meta) { // callback TODO?
        for (let i = 0; i < filelist.length; i++) {
            this.enqueue({
                file: filelist[i],
                meta
            });
        }
    }

    /**
     * Enqueues a work item.
     * @param {object} workitem - The object to be enqueued.
     * @returns {undefined}
     */
    private enqueue(workitem) {
        workitem.time = new Date();
        this.queue.push(workitem);
        this.emit("enqueue", workitem);
        this.emit("change", this.queue);
        if (!this.busy) {
            this.next();
        }
    }

    /**
     * Stop all timeouts and shutdown everything.
     * @return {undefined}
     */
    stop() {
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
