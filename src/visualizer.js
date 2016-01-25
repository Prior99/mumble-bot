import Canvas from "canvas";
import FFMpeg from "fluent-ffmpeg";
import * as FS from "fs";
import AudioAnalyzer from "./audioanalyzer";

const maxUnsignedByte = 240;
const audioFreq = 44100;

/**
 * <b>Async</b> Visualize an audiofile and return the buffer holding a generated png image.
 * @param {string} filename - Name of the audio file to visualize.
 * @param {number} height - Height of the image to generate.
 * @param {number} samplesPerPixel - Number of samples per pixel (determines the width of the image).
 * @return {Buffer} - Buffer holding the generated png image.
 */
const VisualizeAudioFile = function(filename, height, samplesPerPixel) {
	return new Promise((resolve, reject) => {
		try {
			const analyzer = new AudioAnalyzer(samplesPerPixel);
			const ffmpeg = FFMpeg(filename);
			const stream = ffmpeg.format("u8")
				.audioChannels(1)
				.on("error", (err) => reject(err))
				.audioFrequency(audioFreq).stream();
			stream.on("data", (chunk) => {
				const arr = new Float32Array(chunk.length);
				for(let i = 0; i < chunk.length; i++) {
					arr[i] = (chunk[i] / 255) * 2 - 1;
				}
				analyzer.analyze(arr)
			});
			stream.on("end", () => {
				const width = Math.min(analyzer.list.length);
				const canvas = new Canvas(width, height);
				analyzer.draw(canvas);
				resolve(canvas.toBuffer());
			});
		}
		catch(err) {
			reject(err);
		}
	});
};

export default VisualizeAudioFile;
