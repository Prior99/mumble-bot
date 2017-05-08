import * as Winston from "winston";
import * as FS from "fs-promise";
import HTTPCodes from "../../http-codes";

const moneyPerSave = 200;

/**
 * View for saving a record.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const Save = function(bot) {
    return async function(req, res) {
        if(req.body.id && req.body.quote && req.body.labels) {
            const labels = JSON.parse(req.body.labels);
            const sound = bot.getCachedAudioById(req.body.id);
            const quote = req.body.quote;
            try {
                FS.mkdirSync("sounds/recorded");
            }
            catch(e) {
                if(e.code !== "EEXIST") {
                    throw e;
                }
            }
            try {
                const id = await bot.database.addRecord(quote, sound.user, sound.date,
                    labels, sound.duration, req.user);
                try {
                    await bot.database.giveUserMoney(req.user, moneyPerSave);
                    await FS.rename(sound.file, `sounds/recorded/${id}`);
                    await FS.rename(sound.file + ".png", `sounds/visualized/${id}.png`);
                    if(bot.removeCachedAudio(sound)) {
                        Winston.log("verbose", `${req.user.username} added new record #${id}`);
                        res.status(HTTPCodes.okay).send(true);
                    }
                    else {
                        Winston.error("Could not remove element from array of cached audios.");
                        res.status(HTTPCodes.internalError).send({
                            reason: "internal_error"
                        });
                    }
                }
                catch(err) {
                    Winston.error("Could not rename new record file.", err);
                    res.status(HTTPCodes.internalError).send({
                        reason: "internal_error"
                    });
                }
            }
            catch(err) {
                Winston.error("Could not add record to database.", err);
                res.status(HTTPCodes.internalError).send({
                    reason: "internal_error"
                });
            }
        }
        else {
            res.status(HTTPCodes.missingArguments).send({
                reason: "missing_arguments"
            });
        }
    };
};

export default Save;
