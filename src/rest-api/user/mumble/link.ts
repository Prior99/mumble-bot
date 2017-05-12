import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { linkMumbleUser } from "../../../database";

/**
 * <b>/api/users/linkMumbleUser</b> Links a mumble user to a user.
 * server this bot is connected to.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const LinkMumbleUser = function(bot) {
    return async function(req, res) {
        if (req.user.username === req.body.username) {
            try {
                await linkMumbleUser(req.body.id, req.body.username, bot.database);
                Winston.log("verbose", `${req.user.username} linked mumble user with id ${req.body.id}`);
                res.status(HTTP.OK).send(true);
            }
            catch (err) {
                res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                    reason: "internal_error"
                });
            }
        }
        else {
            res.status(HTTP.BAD_REQUEST).send({
                reason: "invalid_user"
            });
        }
    };
};

export default LinkMumbleUser;
