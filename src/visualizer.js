import Canvas from "canvas";
import FFMpeg from "fluent-ffmpeg";
import * as FS from "fs";

const maxUnsignedByte = 240;
const audioFreq = 16000;

/**
 * <b>Async</b> Visualize an audiofile and return the buffer holding a generated png image.
 * @param {string} filename - Name of the audio file to visualize.
 * @param {number} height - Height of the image to generate.
 * @param {number} samplesPerPixel - Number of samples per pixel (determines the width of the image).
 * @return {Buffer} - Buffer holding the generated png image.
 */
const VisualizeAudioFile = function(filename, height, samplesPerPixel) {
	let samplesTotal = 0;
	let turn = 0;
	const list = [];
	const currentBuffer = new Buffer(samplesPerPixel);
	return new Promise((resolve, reject) => {
		try {
			const ffmpeg = FFMpeg(filename);
			const stream = ffmpeg.format("u8")
				.audioChannels(1)
				.on("error", (err) => reject(err))
				.audioFrequency(audioFreq).stream();
			stream.on("data", chunk => {
				samplesTotal += chunk.length;
				for(let taken = 0; taken < chunk.length;) {
					const toRead = Math.min(samplesPerPixel - turn, chunk.length - taken);
					for(let i = 0; i < toRead; i++) {
						const value = chunk[i + taken];
						currentBuffer.writeUInt8(value, i + turn);
					}
					turn += toRead;
					taken += toRead;
					if(turn === samplesPerPixel) {
						turn = 0;
						let max = 0;
						let min = 0;
						let sum = 0;
						for(let i = 0; i < currentBuffer.length; i++) {
							const value = currentBuffer[i] / maxUnsignedByte;
							if(i === 0 || value > max) { max = value; }
							if(i === 0 || value < min) { min = value; }
							sum += value;
						}
						console.log({
							avg : sum / currentBuffer.length,
							max,
							min
						});
						list.push({
							avg : sum / currentBuffer.length,
							max,
							min
						});
					}
				}
			});
			stream.on("end", () => {
				const width = Math.min(list.length);
				const canvas = new Canvas(width, height);
				const ctx = canvas.getContext("2d");
				const val = (v) => v * height;
				if(list.length > 0) {
					ctx.beginPath();
					ctx.moveTo(0, val(list[0].avg));
					for(let i = 1; i < list.length; i++) {
						ctx.lineTo(i, val(list[i].min));
					}
					ctx.stroke();
					ctx.beginPath();
					ctx.moveTo(0, val(list[0].avg));
					for(let i = 1; i < list.length; i++) {
						ctx.lineTo(i, val(list[i].max));
					}
					ctx.stroke();
				}
				resolve(canvas.toBuffer());
			});
		}
		catch(err) {
			reject(err);
		}
	});
};

export default VisualizeAudioFile;
