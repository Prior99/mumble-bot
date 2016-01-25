import * as Winston from "winston";
import reply from "../util.js";
import HTTPCodes from "../../httpcodes";
import FFMpeg from "fluent-ffmpeg";
import * as FS from "fs";
import {PassThrough as PassThroughStream} from "stream";

const audioFreq = 48000;

/**
 * This view is responsible for forking records.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewFork = function(bot) {
	return async function(req, res) {
		const id = +req.query.id;
		const quote = req.query.quote;
		const actions = JSON.parse(req.query.actions);
		const overwrite = JSON.parse(req.query.overwrite);
		Winston.verbose(req.session.user.username +" is forking record #" + id);
		let newId, record, duration;
		try {
			record = await bot.database.getRecord(id);
			duration = record.duration;
			for(const action of actions) {
				if(action.action === "crop") {
					duration = action.end - action.begin;
				}
			}
			newId = await bot.database.forkRecord(record.user, record.submitted, quote, id, overwrite, req.session.user, duration);
		}
		catch(err) {
			Winston.error("Error occured while metadata on fork of record: ", err);
			reply(res, HTTPCodes.internalError, false, { reason : "internal_error" });
			return;
		}

		const crop = (begin, end) => {
			return new Promise((resolve, reject) => {
				let frames = 0;
				const beginByte = audioFreq * begin * 4; // 4 because of the bytes/floats
				const endByte = audioFreq * end * 4;
				const passthrough = new PassThroughStream();
				const inputFile = "sounds/recorded/" + id;
				const outputFile = "sounds/recorded/" + newId;
				Winston.verbose("Cropping file " + inputFile + " to file " + outputFile);
				const encoder = FFMpeg(passthrough)
					.inputOptions(
						"-f", "s32le",
						"-ar", audioFreq,
						"-ac", "1"
					)
					.audioCodec("libmp3lame")
					.on("error", (err) => reject(err))
					.save(outputFile);
				const decoder = FFMpeg(inputFile);
				const stream = decoder
					.format("s32le")
					.audioChannels(1)
					.audioFrequency(audioFreq)
					.on("error", (err) => reject(err))
					.stream();
				stream.on("data", (chunk) => {
					if(frames + chunk.length >= beginByte && frames <= endByte) {
						const startSlice = Math.max(0, beginByte - frames);
						const endSlice = Math.min(chunk.length, endByte - frames);
						const slice = chunk.slice(startSlice, endSlice);
						console.log(slice);
						passthrough.write(slice);
					}
					frames += chunk.length;
				})
				.on("end", () => {
					passthrough.end();
					resolve();
				});
			});
		};

		try {
			for(const action of actions) {
				if(action.action === "crop") {
					await crop(+action.begin, +action.end);
				}
			}
			reply(res, HTTPCodes.okay, true, {});
		}
		catch(err) {
			Winston.error("Error occured while processing fork on record: ", err);
			reply(res, HTTPCodes.internalError, false, { reason : "internal_error" });
		}
	};
};

export default ViewFork;
