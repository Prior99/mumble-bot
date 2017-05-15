import * as FFT from "fft-js";
import { audioFreq, chunkSize } from "./visualizer";
import * as Color from "onecolor";

const minHumanFreq = 125;
const maxHumanFreq = 10000;

interface Values {
    amplitude: number;
    freq: number;
}

/**
 * Analyzes a stream of audio which can be fed chunk by chunk to this class.
 * When done, can draw a nice image onto a canvas.
 */
class AudioAnalyzer {
    public list: Values[];

    private samplesTotal: number = 0;
    /**
     * @constructor
     * @param {number} samplesPerPixel - Number of samples represented by one pixel.
     */
    constructor() {
        this.samplesTotal = 0;
        this.list = [{
            amplitude: 0.5,
            freq: 0
        }];
    }

    /**
     * Analyze one chunk of audio data.
     * @param {Buffer} chunk - Audio data which should be analyzed.
     * @return {undefined}
     */
    analyze(chunk) {
        const array = Array.prototype.slice.call(chunk);
        if (array.length !== chunkSize) {
            return;
        }
        this.samplesTotal += chunk.length;
        let max = 0;
        for (let i = 0; i < array.length; i++) {
            const value = array[i];
            if (i === 0 || value > max) { max = value; }
        }
        const phasors = FFT.fft(array);
        const frequencies = FFT.util.fftFreq(phasors, 44100);
        const magnitudes = FFT.util.fftMag(phasors);
        const maxValue = Math.max.apply(magnitudes);
        const maxIndex = magnitudes.reduce((maxIndex, value, index) =>
            value > magnitudes[maxIndex] ? index : maxIndex, 0
        );
        this.list.push({
            amplitude: max,
            freq: frequencies[maxIndex]
        });
    }

    /**
     * This method can be called when all data was processed.
     * A nice image will be drawn onto the canvas representing all audio that was analyzed.
     * @param {Canvas} canvas - A HTML5 canvas region to draw on.
     * @return {undefined}
     */
    draw(canvas) {
        const overallMax = this.list.reduce((result, value) => result > value.amplitude ? result : value.amplitude, 0);
        const values = this.list.map(item => ({ ...item, amplitude: item.amplitude / overallMax }));
        const width = canvas.width;
        const height = canvas.height;
        const pixelsPerElement = width / values.length;
        const ctx = canvas.getContext("2d");
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        for (let i = 1; i < values.length; i++) {
            const { freq } = values[i];
            const relFreq = (freq - minHumanFreq) / (maxHumanFreq - minHumanFreq);
            const color = Color("#FFFFFF").hue(0.05 + relFreq * 0.95, true).saturation(1).lightness(0.5).hex();
            gradient.addColorStop(i / values.length, color);
        }
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, height - values[1].amplitude * height);
        for (let i = 1; i < values.length; i++) {
            const { amplitude, freq } = values[i];
            ctx.lineTo(i * pixelsPerElement, height - amplitude * height);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.fill();
    }
}

export default AudioAnalyzer;
