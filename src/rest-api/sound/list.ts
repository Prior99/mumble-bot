import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { listSounds } from "../../database";

/**
 * <b>/sounds/</b> Displays the home page for the /sounds/ endpoint (A list of all sounds).
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const Sounds = function(bot) {
    return async function(req, res) {
        try {
            const sounds = await listSounds(bot.database);
            res.send({
                sounds
            });
        }
        catch (err) {
            Winston.error("Could not get list of sounds", err);
            res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                reason: "internal_error"
            });
        }
        res.render("sounds/sounds");
    };
};

export default Sounds;
