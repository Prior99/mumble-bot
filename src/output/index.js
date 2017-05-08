import Winston from "winston";
import Sound from "./sound";
import Stream from "stream";

const PREBUFFER = 0.5;
const audioFreq = 48000;
const msInS = 1000;

/**
 * Audio output for the bot. This class handles the whole audio output,
 * including both TTS and sounds.
 */
class Output extends Stream.Writable {

    /**
     * @constructor
     * @param {Bot} bot - Bot this belongs to.
     */
    constructor(bot) {
        super(); // TODO
        this.bot = bot;
        this.stream = bot.mumble.inputStream();
        this.sound = new Sound(this);
        this.busy = false;
        this.queue = [];
        this.current = null;
        this._bufferQueue = [];
        this._playbackAhead = 0;
    }
    //var PREBUFFER = 0.5; TODO see above

    /**
     * Processes the buffer and keeps the stream to mumble filled.
     * @returns {undefined}
     */
    _shiftBuffer() {
        if(this.stopped) {
            return;
        }
        if(this._lastBufferShift) {
            const timePassed = (Date.now() - this._lastBufferShift) / msInS;
            this._playbackAhead -= timePassed;
        }
        if(this._bufferQueue.length > 0) {
            const start = Date.now();
            if(this._playbackAhead < 0 && this._lastBufferShift) {
                Winston.warn("Buffer underflow.");
            }
            while(this._playbackAhead < PREBUFFER && this._bufferQueue.length > 0) {
                const b = this._bufferQueue.shift();
                const lengthOfBuffer = (b.length / 2) / audioFreq;
                this._playbackAhead += lengthOfBuffer;
                this.stream.write(b);
            }
            let waitFor;
            const overfilled = this._playbackAhead - PREBUFFER;
            if(overfilled > 0) {
                waitFor = msInS * overfilled;
            }
            else {
                waitFor = 100;
            }
            this._timeout = setTimeout(this._shiftBuffer.bind(this), waitFor);
            this._lastBufferShift = Date.now();
        }
        else {
            this._playbackAhead = 0;
            this._lastBufferShift = null;
            this._timeout = null;
        }
    }

    /**
     * Write something into this stream.
     * @param {buffer} chunk - Chunk to be written to the queue.
     * @param {string} encoding - Encoding of the cunk if any.
     * @param {VoidCallback} done - Called when the data is shifted into the queue.
     * @returns {undefined}
     */
    _write(chunk, encoding, done) {
        this._bufferQueue.push(chunk);
        if(!this._timeout) {
            this._shiftBuffer(); //Not currently processing queue? Sleeping? Wake up!
        }
        done();
    }

    /**
     * Clear the whole queue and stop current playback.
     * @returns {undefined}
     */
    clear() {
        this.queue = [];
        this._bufferQueue = [];
        this.sound.clear();
        this.emit("clear");
    }

    /**
     * Start processing the next item in the queue.
     * @returns {undefined}
     */
    _next() {
        if(!this.busy && this.queue.length !== 0) {
            this.current = this.queue.shift();
            this.emit("change", this.queue);
            this.emit("dequeue");
            this._process(this.current);
        }
    }

    /**
     * Process the next item.
     * @returns {undefined}
     */
    _process() {
        this._processStarted();
        this.sound.enqueue({
            file : this.current.file,
            callback : this._processStopped.bind(this)
        });
    }

    /**
     * When processing the next item started.
     * @returns {undefined}
     */
    _processStarted() {
        this.busy = true;
        this.emit("start", this.current);
    }

    /**
     * When processing stopped.
     * @returns {undefined}
     */
    _processStopped() {
        const callback = this.current.callback;
        this.current = null;
        this.busy = false;
        this.emit("stop");
        if(callback) {
            callback();
        }
        this._next();
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
            this._enqueue({
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
        for(let i=0; i<filelist.length; i++) {
            this._enqueue({
                file : filelist[i],
                meta
            });
        }
    }

    /**
     * Enqueues a work item.
     * @param {object} workitem - The object to be enqueued.
     * @returns {undefined}
     */
    _enqueue(workitem) {
        workitem.time = new Date();
        this.queue.push(workitem);
        this.emit("enqueue", workitem);
        this.emit("change", this.queue);
        if(!this.busy) {
            this._next();
        }
    }

    /**
     * Changes the voice of the ESpeak TTS from female to male and vice-verse.
     * @deprecated Is no longer needed as Google Translate TTS is now used instead of ESpeak.
     * @returns {undefined}
     */
    changeGender() {
        this.speech.changeGender();
        this.say("Geschlechtsumwandlung erfolgreich.");
    }

    /**
     * Stop all timeouts and shutdown everything.
     * @return {undefined}
     */
    stop() {
        this.stopped = true;
        this.clear();
        if(this._timeout) {
            clearTimeout(this._timeout);
        }
        this.speech.stop();
        this.sound.stop();
        this.stream.close();
        this.stream.end();
        Winston.info("Output stopped.");
    }
}

module.exports = Output;
