import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { giveUserMoney, getRecord, usedRecord } from "../../database";

const moneyPerPlayReporter = 1;
const moneyPerPlayUser = 1;

/**
 * This view is responsible for playing back a stored record.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
export const Play = (bot) => async ({ params, user }, res) => {
    const { id } = params;
    try {
        const details = await getRecord(id, bot.database);
        if (user.id !== details.reporter.id) {
            await giveUserMoney(details.reporter, moneyPerPlayReporter, bot.database);
        }
        if (user.id !== details.user.id) {
            await giveUserMoney(details.user, moneyPerPlayUser, bot.database);
        }
        await usedRecord(id, bot.database);
        Winston.log("verbose", `${user.username} played back record #${id}`);
        bot.playSound("sounds/recorded/" + id, {
            type: "record",
            details,
            user: user
        });
        res.status(HTTP.OK).send(true);
    }
    catch (err) {
        Winston.error("Could not increase usages of record", err);
        res.status(HTTP.INTERNAL_SERVER_ERROR).send({
            reason: "internal_error"
        });
    }
};
