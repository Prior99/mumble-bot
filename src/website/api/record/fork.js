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
			// Calculate new duration
			record = await bot.database.getRecord(id);
			duration = record.duration;
			for(const action of actions) {
				if(action.action === "crop") {
					duration = action.end - action.begin;
				}
			}
			// Fork in the database
			newId = await bot.database.forkRecord(
				record.user,
				new Date(),
				quote,
				id,
				overwrite,
				req.session.user,
				duration
			);
		}
		catch(err) {
			Winston.error("Error occured while metadata on fork of record: ", err);
			reply(res, HTTPCodes.internalError, false, { reason : "internal_error" });
			return;
		}

		const crop = (begin, end) => new Promise((resolve, reject) => {
			const transcoder = FFMpeg("sounds/recorded/" + id)
				.seekInput(begin)
				.duration(end - begin)
				.format("mp3")
				.audioCodec("libmp3lame")
				.on("error", (err) => reject(err))
				.save("sounds/recorded/" + newId);
		});

		try {
			// Perform the actual modifications
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
