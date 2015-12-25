import * as Winston from "winston";
import FS from "fs-promise";
import HTTPCodes from "../../httpcodes";
import VisualizeAudioFile from "../../../visualizer";

const height = 32;
const samplesPerPixel = 400;

/**
 * This view handles the downloading of visualizations of the records.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewVisualized = function(bot) {
	return async function(req, res) {
		const dirName = "sounds/visualized";
		const soundFileName = "sounds/recorded/" + req.query.id;
		const fileName = dirName + "/" + req.query.id + ".png";
		const sendFile = function(stream) {
			res.status(HTTPCodes.okay);
			stream.pipe(res);
		};
		try {
			FS.mkdirSync(dirName);
		}
		catch(e) {
			if(e.code !== "EEXIST") {
				res.status(HTTPCodes.internalError).send({
					okay : false,
					reason : "internal_error"
				});
				throw e;
			}
		}
		if(req.query.id) {
			let stream;
			try {
				await FS.stat(fileName);
				stream = FS.createReadStream(fileName);
				sendFile(stream);
			}
			catch(err) {
				if(err.code === "ENOENT") {
					Winston.info("Visualizing audio file \"" + soundFileName + "\" to \"" + fileName + "\".");
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
								Winston.error("Unknown error when accessing file from visualizer:", err);
							}
							res.status(HTTPCodes.internalError).send({
								okay : false,
								reason : "internal_error"
							});
						}
					}
					catch(err) {
						Winston.error("Error occured when viusalizing file:", err);
						res.status(HTTPCodes.internalError).send({
							okay : false,
							reason : "internal_error"
						});
					}
				}
				else {
					Winston.error("Error occured during request of sound visualization:", err);
					res.status(HTTPCodes.internalError).send({
						okay : false,
						reason : "internal_error"
					});
				}
			}
		}
		else {
			res.status(HTTPCodes.missingArguments).send({
				okay : false,
				reason : "missing_arguments"
			});
		}
	};
};

export default ViewVisualized;
