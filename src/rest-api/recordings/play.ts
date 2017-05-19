import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { giveUserMoney, getRecording, usedRecording } from "../../database";
import { Bot } from "../..";
import { AuthorizedApiEndpoint } from "../types";
import { internalError, okay } from "../utils";

const moneyPerPlayReporter = 1;
const moneyPerPlayUser = 1;

/**
 * This api endpoint is responsible for playing back a stored record.
 */
export const Play: AuthorizedApiEndpoint = (bot: Bot) => async ({ params, user }, res) => {
    const id = parseInt(params.id);
    try {
        const recording = await getRecording(id, bot.database);
        if (user.id !== recording.reporter) {
            await giveUserMoney(recording.reporter, moneyPerPlayReporter, bot.database);
        }
        if (user.id !== recording.user) {
            await giveUserMoney(recording.user, moneyPerPlayUser, bot.database);
        }
        await usedRecording(id, bot.database);
        Winston.log("verbose", `${user.username} played back record #${id}`);
        bot.playSound("sounds/recorded/" + id, {
            type: "recording",
            recording,
            user: user
        });
        return okay(res);
    }
    catch (err) {
        Winston.error("Could not increase usages of record", err);
        return internalError(res);
    }
};
