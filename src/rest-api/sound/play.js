import * as Winston from "winston";
import HTTPCodes from "../http-codes";

/**
 * View for playback endpoint of sound section.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const SoundPlay = function(bot) {
    return async function(req, res) {
        if(req.body.id) {
            try {
                await bot.database.usedSound(req.body.id);
                const details = await bot.database.getSound(req.body.id);
                Winston.log("verbose", `${req.session.user.username} played sound #${req.body.id}`);
                bot.playSound(`sounds/uploaded/${req.body.id}`, {
                    type: "sound",
                    details,
                    user: req.user
                });
                res.status(HTTPCodes.okay).send({
                });
            }
            catch(err) {
                Winston.error("Could not increase usages of sound", err);
                res.status(HTTPCodes.internalError).send({
                    reason: "internal_error"
                });
            }
        }
        else {
            res.status(HTTPCodes.missingArguments).send({
                reason: "missing_arguments"
            })
        }
    };
};

export default SoundPlay;
