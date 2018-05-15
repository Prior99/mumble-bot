import { fft, util } from "fft-js";
import { chunkSize } from "./visualizer";
import * as Color from "color";

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
export class AudioAnalyzer {
    public list: Values[];

    constructor() {
        this.list = [
            {
                amplitude: 0.5,
                freq: 0,
            },
        ];
    }

    /**
     * Analyze one chunk of audio data.
     * @param chunk Audio data which should be analyzed.
     */
    public analyze(chunk: Float32Array) {
        const array = Array.prototype.slice.call(chunk);
        if (array.length !== chunkSize) {
            return;
        }
        let max = 0;
        for (let i = 0; i < array.length; i++) {
            const value = array[i];
            if (i === 0 || value > max) { max = value; }
        }
        const phasors = fft(array);
        const frequencies = util.fftFreq(phasors, 44100);
        const magnitudes = util.fftMag(phasors);
        const maxIndex = magnitudes.reduce((result, value, index) => value > magnitudes[result] ? index : result, 0);
        this.list.push({
            amplitude: max,
            freq: frequencies[maxIndex],
        });
    }

    /**
     * This method can be called when all data was processed.
     * A nice image will be drawn onto the canvas representing all audio that was analyzed.
     * @param canvas A HTML5 canvas region to draw on.
     */
    public draw(canvas) {
        if (this.list.length < 2) {
            return;
        }
        const overallMax = this.list.reduce((result, value) => result > value.amplitude ? result : value.amplitude, 0);
        const values = this.list.map(item => ({
            ...item,
            amplitude: item.amplitude / overallMax,
        }));
        const width = canvas.width;
        const height = canvas.height;
        const pixelsPerElement = width / values.length;
        const ctx = canvas.getContext("2d");
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        for (let i = 1; i < values.length; i++) {
            const { freq } = values[i];
            const relFreq = (freq - minHumanFreq) / (maxHumanFreq - minHumanFreq);
            const color = Color
                .hsl(360 * (0.05 + relFreq * 0.95), 100, 50)
                .toString();
            gradient.addColorStop(i / values.length, color);
        }
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, height - values[1].amplitude * height);
        for (let i = 1; i < values.length; i++) {
            const { amplitude } = values[i];
            ctx.lineTo(i * pixelsPerElement, height - amplitude * height);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.fill();
    }
}
