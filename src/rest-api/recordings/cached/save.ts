import * as Winston from "winston";
import * as FS from "async-file";
import * as HTTP from "http-status-codes";
import { addRecording, giveUserMoney } from "../../../database";

const moneyPerSave = 200;

/**
 * View for saving a record.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const Save = function(bot) {
    return async function(req, res) {
        if (req.body.id && req.body.quote && req.body.labels) {
            const labels = JSON.parse(req.body.labels);
            const sound = bot.getCachedAudioById(req.body.id);
            const quote = req.body.quote;
            try {
                FS.mkdir("sounds/recorded");
            }
            catch (e) {
                if (e.code !== "EEXIST") {
                    throw e;
                }
            }
            try {
                const id = await addRecording(quote, sound.user, sound.date,
                    labels, sound.duration, req.user, bot.database);
                try {
                    await giveUserMoney(req.user, moneyPerSave, bot.database);
                    await FS.rename(sound.file, `sounds/recorded/${id}`);
                    await FS.rename(sound.file + ".png", `sounds/visualized/${id}.png`);
                    if (bot.removeCachedAudio(sound)) {
                        Winston.log("verbose", `${req.user.username} added new record #${id}`);
                        res.status(HTTP.OK).send(true);
                    }
                    else {
                        Winston.error("Could not remove element from array of cached audios.");
                        res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                            reason: "internal_error"
                        });
                    }
                }
                catch (err) {
                    Winston.error("Could not rename new record file.", err);
                    res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                        reason: "internal_error"
                    });
                }
            }
            catch (err) {
                Winston.error("Could not add record to database.", err);
                res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                    reason: "internal_error"
                });
            }
        }
        else {
            res.status(HTTP.BAD_REQUEST).send({
                reason: "missing_arguments"
            });
        }
    };
};

export default Save;
