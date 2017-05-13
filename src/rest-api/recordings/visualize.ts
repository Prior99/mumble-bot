import * as Winston from "winston";
import * as FS from "async-file";
import * as HTTP from "http-status-codes";
import VisualizeAudioFile from "../../visualizer";

const height = 32;
const samplesPerPixel = 400;

/**
 * This view handles the downloading of visualizations of the records.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
export const Visualized = (bot) => async (req, res) => {
    const sendFile = stream => {
        res.status(HTTP.OK);
        stream.pipe(res);
    };

    const dirName = "sounds/visualized";
    const soundFileName = `sounds/recorded/${req.body.id}`;
    const fileName = `${dirName}/${req.body.id}.png`;
    try {
        await FS.mkdir(dirName);
    }
    catch (e) {
        if (e.code !== "EEXIST") {
            res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                reason: "internal_error"
            });
            throw e;
        }
    }
    if (req.body.id) {
        let stream;
        try {
            await FS.stat(fileName);
            stream = FS.createReadStream(fileName);
            sendFile(stream);
        }
        catch (err) {
            if (err.code === "ENOENT") {
                Winston.info(`Visualizing audio file "${soundFileName}" to "${fileName}".`);
                try {
                    const buffer = await VisualizeAudioFile(soundFileName, height, samplesPerPixel);
                    await FS.writeFile(fileName, buffer);
                    try {
                        const stream = FS.createReadStream(fileName);
                        sendFile(stream);
                    }
                    catch (err) {
                        if (err.code === "ENOENT") {
                            Winston.error("Visualizer did not create a file.");
                        }
                        else {
                            Winston.error("Unknown error when accessing file from visualizer.", err);
                        }
                        res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                            reason: "internal_error"
                        });
                    }
                }
                catch (err) {
                    Winston.error("Error occured when viusalizing file.", err);
                    res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                        reason: "internal_error"
                    });
                }
            }
            else {
                Winston.error("Error occured during request of sound visualization.", err);
                res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                    reason: "internal_error"
                });
            }
        }
    }
    else {
        res.status(HTTP.BAD_REQUEST).send({
            reason: "missing_arguments"
        });
    }
};
