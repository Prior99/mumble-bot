import * as Winston from "winston";
import * as Canvas from "canvas";
import * as FFMpeg from "fluent-ffmpeg";
import * as FS from "fs";
import AudioAnalyzer from "./audioanalyzer";
import * as ChunkingStreams from "chunking-streams";

const maxUnsignedByte = 240;
export const audioFreq = 44100;
const maxByte = 255;
export const chunkSize = 256;

/**
 * Visualize an audiofile and return the buffer holding a generated png image.
 * @param {string} filename - Name of the audio file to visualize.
 * @param {number} height - Height of the image to generate.
 * @param {number} samplesPerPixel - Number of samples per pixel (determines the width of the image).
 * @return {Buffer} - Buffer holding the generated png image.
 */
export const visualizeAudioFile = function(filename, width, height, samplesPerPixel) {
    return new Promise((resolve, reject) => {
        try {
            const analyzer = new AudioAnalyzer();
            const ffmpeg = FFMpeg(filename);
            const stream = ffmpeg.format("u8")
                .audioChannels(1)
                .on("error", (err) => reject(err))
                .audioFrequency(audioFreq).stream();
            const chunker = new ChunkingStreams.SizeChunker({ chunkSize });
            chunker.on("data", ({ data }) => {
                const arr = new Float32Array(data.length);
                for (let i = 0; i < data.length; i++) {
                    arr[i] = (data[i] / maxByte) * 2 - 1;
                }
                analyzer.analyze(arr)
            });
            chunker.on("end", () => {
                const canvas = new Canvas(width, height);
                analyzer.draw(canvas);
                resolve(canvas.toBuffer());
            });
            stream.pipe(chunker);
        }
        catch (err) {
            Winston.error("Error visualizing audio file:", err);
            reject(err);
        }
    });
};
