import * as Winston from "winston";
import HTTPCodes from "../../http-codes";
import * as FS from "fs";

/**
 * View for the visualization of a cached audio
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const VisualizedCached = function(bot) {
    return function(req, res) {
        if(req.body.id) {
            const sound = bot.getCachedAudioById(+req.body.id);
            if(sound) {
                res.status(HTTPCodes.okay);
                FS.createReadStream(`${sound.file}.png`).pipe(res);
            }
            else {
                res.status(HTTPCodes.invalidRequest).send({
                    reason: "invalid_argument"
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
export default VisualizedCached;
