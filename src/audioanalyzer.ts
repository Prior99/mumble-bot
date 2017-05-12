interface Values {
    avg: number;
    min: number;
    max: number;
}

/**
 * Analyzes a stream of audio which can be fed chunk by chunk to this class.
 * When done, can draw a nice image onto a canvas.
 */
class AudioAnalyzer {
    public list: Values[];

    private samplesTotal: number = 0;
    private turn: number = 0;
    private pixelOffset: number = 0;
    private currentBuffer: Float32Array;
    private samplesPerPixel: number;
    /**
     * @constructor
     * @param {number} samplesPerPixel - Number of samples represented by one pixel.
     */
    constructor(samplesPerPixel) {
        this.samplesTotal = 0;
        this.turn = 0;
        this.pixelOffset = 0;
        this.list = [{
            avg: 0.5,
            min: 0.5,
            max: 0.5
        }];
        this.currentBuffer = new Float32Array(samplesPerPixel);
        this.samplesPerPixel = samplesPerPixel;
    }

    /**
     * Analyze one chunk of audio data.
     * @param {Buffer} chunk - Audio data which should be analyzed.
     * @return {undefined}
     */
    analyze(chunk) {
        this.samplesTotal += chunk.length;
        for (let taken = 0; taken < chunk.length;) {
            const toRead = Math.min(this.samplesPerPixel - this.turn, chunk.length - taken);
            for (let i = 0; i < toRead; i++) {
                const value = chunk[i + taken];
                this.currentBuffer[i + this.turn] = value;
            }
            this.turn += toRead;
            taken += toRead;
            if (this.turn === this.samplesPerPixel) {
                this.turn = 0;
                let max = 0;
                let min = 0;
                let sum = 0;
                for (let i = 0; i < this.currentBuffer.length; i++) {
                    const value = (this.currentBuffer[i] + 1) / 2;
                    if (i === 0 || value > max) { max = value; }
                    if (i === 0 || value < min) { min = value; }
                    sum += value;
                }
                this.list.push({
                    avg: sum / this.currentBuffer.length,
                    max,
                    min
                });
            }
        }
    }

    /**
     * This method can be called when all data was processed.
     * A nice image will be drawn onto the canvas representing all audio that was analyzed.
     * @param {Canvas} canvas - A HTML5 canvas region to draw on.
     * @return {undefined}
     */
    draw(canvas) {
        const width = this.list.length;
        const height = canvas.height;
        const ctx = canvas.getContext("2d");
        ctx.strokeStyle = "black";
        const val = (v) => v * height;
        if (this.list.length > 0) {
            ctx.beginPath();
            ctx.moveTo(this.pixelOffset - 1, val(this.list[0].min));
            for (let i = 1; i < this.list.length; i++) {
                ctx.lineTo(this.pixelOffset + i - 1, val(this.list[i].min));
            }
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.pixelOffset - 1, val(this.list[0].max));
            for (let i = 1; i < this.list.length; i++) {
                ctx.lineTo(this.pixelOffset + i - 1, val(this.list[i].max));
            }
            ctx.stroke();
            this.pixelOffset += this.list.length - 1;
            this.list = [this.list.pop()];
        }
    }
}

export default AudioAnalyzer;
