import * as Winston from "winston";
import HTTPCodes from "../http-codes";

const moneyPerPlayReporter = 1;
const moneyPerPlayUser = 1;

/**
 * This view is responsible for playing back a stored record.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const Play = (bot) => ({ params, user }, res) => {
    const { id } = params;
    try {
        const details = await bot.database.getRecord(id);
        if(user.id !== details.reporter.id) {
            await bot.database.giveUserMoney(details.reporter, moneyPerPlayReporter);
        }
        if(user.id !== details.user.id) {
            await bot.database.giveUserMoney(details.user, moneyPerPlayUser);
        }
        await bot.database.usedRecord(id);
        Winston.log("verbose", `${user.username} played back record #${id}`);
        bot.playSound("sounds/recorded/" + id, {
            type: "record",
            details,
            user: user
        });
        res.status(HTTPCodes.okay).send(true);
    }
    catch(err) {
        Winston.error("Could not increase usages of record", err);
        res.status(HTTPCodes.internalError).send({
            reason: "internal_error"
        });
    }
};

export default Play;
