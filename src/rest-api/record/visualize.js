import * as Winston from "winston";
import FS from "fs-promise";
import HTTPCodes from "../http-codes";
import VisualizeAudioFile from "../../visualizer";

const height = 32;
const samplesPerPixel = 400;

const sendFile = stream => {
	res.status(HTTPCodes.okay);
	stream.pipe(res);
};

/**
 * This view handles the downloading of visualizations of the records.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const Visualized = function(bot) {
	return async function(req, res) {
		const dirName = "sounds/visualized";
		const soundFileName = `sounds/recorded/${req.body.id}`;
		const fileName = `${dirName}/${req.body.id}.png`;
		try {
			FS.mkdirSync(dirName);
		}
		catch(e) {
			if(e.code !== "EEXIST") {
				res.status(HTTPCodes.internalError).send({
					reason: "internal_error"
				});
				throw e;
			}
		}
		if(req.body.id) {
			let stream;
			try {
				await FS.stat(fileName);
				stream = FS.createReadStream(fileName);
				sendFile(stream);
			}
			catch(err) {
				if(err.code === "ENOENT") {
					Winston.info(`Visualizing audio file "${soundFileName}" to "${fileName}".`);
					try {
						const buffer = await VisualizeAudioFile(soundFileName, height, samplesPerPixel);
						await FS.writeFile(fileName, buffer);
						try {
							const stream = FS.createReadStream(fileName);
							sendFile(stream);
						}
						catch(err) {
							if(err.code === "ENOENT") {
								Winston.error("Visualizer did not create a file.");
							}
							else {
								Winston.error("Unknown error when accessing file from visualizer.", err);
							}
							res.status(HTTPCodes.internalError).send({
								reason: "internal_error"
							});
						}
					}
					catch(err) {
						Winston.error("Error occured when viusalizing file.", err);
						res.status(HTTPCodes.internalError).send({
							reason: "internal_error"
						});
					}
				}
				else {
					Winston.error("Error occured during request of sound visualization.", err);
					res.status(HTTPCodes.internalError).send({
						reason: "internal_error"
					});
				}
			}
		}
		else {
			res.status(HTTPCodes.missingArguments).send({
				reason: "missing_arguments"
			});
		}
	};
};

export default Visualized;
