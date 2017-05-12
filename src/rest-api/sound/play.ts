import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { usedSound, getSound } from "../../database";

/**
 * View for playback endpoint of sound section.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const SoundPlay = function(bot) {
    return async function(req, res) {
        if (req.body.id) {
            try {
                await usedSound(req.body.id, bot.database);
                const details = await getSound(req.body.id, bot.database);
                Winston.log("verbose", `${req.session.user.username} played sound #${req.body.id}`);
                bot.playSound(`sounds/uploaded/${req.body.id}`, {
                    type: "sound",
                    details,
                    user: req.user
                });
                res.status(HTTP.OK).send({
                });
            }
            catch (err) {
                Winston.error("Could not increase usages of sound", err);
                res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                    reason: "internal_error"
                });
            }
        }
        else {
            res.status(HTTP.BAD_REQUEST).send({
                reason: "missing_arguments"
            })
        }
    };
};

export default SoundPlay;
