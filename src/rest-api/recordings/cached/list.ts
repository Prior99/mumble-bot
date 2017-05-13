import * as Winston from "winston";
import { Bot } from "../../..";
import { compareCachedAudio } from "../../../utils/cached-autio";
import { okay } from "../../utils";
import { ApiEndpoint } from "../../types";

/**
 * Displays the page enpoint for the list of cached records.
 */
export const List: ApiEndpoint = (bot: Bot) => (req, res) => {
    const copy = bot.cachedAudios.slice();
    return okay(res, {
        cached: copy.sort(compareCachedAudio)
    });
};
