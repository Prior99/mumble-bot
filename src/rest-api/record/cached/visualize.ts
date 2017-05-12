import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import * as FS from "fs";

/**
 * View for the visualization of a cached audio
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const VisualizedCached = function(bot) {
    return function(req, res) {
        if (req.body.id) {
            const sound = bot.getCachedAudioById(+req.body.id);
            if (sound) {
                res.status(HTTP.OK);
                FS.createReadStream(`${sound.file}.png`).pipe(res);
            }
            else {
                res.status(HTTP.BAD_REQUEST).send({
                    reason: "invalid_argument"
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
export default VisualizedCached;
