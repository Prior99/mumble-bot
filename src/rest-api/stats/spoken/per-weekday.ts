import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getSpokenPerWeekday } from "../../../database";
import { AuthorizedApiEndpoint } from "../../types";
import { Bot } from "../../..";
import { okay, internalError } from "../../utils";

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Api endpoint for statistics about speech per weekday.
 */
export const PerWeekday: AuthorizedApiEndpoint = (bot: Bot) => async (req, res) => {
    try {
        const spoken = await getSpokenPerWeekday(bot.database);
        return okay(res, spoken.map((elem) => ({
            amount: elem.amount,
            day: weekdays[elem.day - 1]
        })));
    }
    catch (err) {
        Winston.error("Could not get speech amount per weekday.", err);
        return internalError(res);
    }
};
