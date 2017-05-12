import * as Winston from "winston";
import * as HTTP from "http-status-codes";

/**
 * <b>/record/labels/</b> Page for listing and creating labels.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
export const Labels = (bot) => async (req, res) => {
    try {
        const labels = await listLabels(bot.database);
        res.send({ labels });
    }
    catch (err) {
        Winston.error("Error listing labels", err);
        res.status(HTTP.INTERNAL_SERVER_ERROR).send({
            reason: "missing_arguments"
        });
    }
};
