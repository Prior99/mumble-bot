import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { setSetting } from "../../database";

/**
 * Apply the settings from the api callback to the database and reload the session.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const Settings = function(bot) {
    return async function(req, res) {
        const settings = [];
        if (req.body.record) {
            settings.push({ key: "record", val: req.body.record });
        }
        try {
            const promises = settings.map(setting => setSetting(req.user, setting.key, setting.val, bot.database));
            await Promise.all(promises);
            try {
                res.status(HTTP.OK).send(true);
            }
            catch (err) {
                Winston.error("Error reloading user into session.", err);
                res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                    reason: "internal_error"
                });
            }
        }
        catch (err) {
            Winston.error("An error occured while saving settings for user " + req.user.username, err);
            res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                reason: "internal_error"
            });
        }
    };
};

export default Settings;
