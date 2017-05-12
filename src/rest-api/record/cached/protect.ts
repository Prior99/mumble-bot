import * as Winston from "winston";
import * as HTTP from "http-status-codes";

/**
 * View for portecting a cached record.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ProtectCachedRecord = function(bot) {
    return function(req, res) {
        if (req.body.id) {
            if (bot.protectCachedAudio(req.body.id)) {
                res.status(HTTP.OK).send(true);
            }
            else {
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

export default ProtectCachedRecord;
