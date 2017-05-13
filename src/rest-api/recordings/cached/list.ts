import * as Winston from "winston";

/**
 * <b>/record/cached/</b> Displays the page enpoint for the list of cached records.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const Cached = function(bot) {
    return function(req, res) {
        const copy = bot.cachedAudios.slice();
        res.send({
            cached: copy.sort((a, b) => {
                if (a.protected === b.protected) {
                    return a.date > b.date ? -1 : 1;
                }
                else {
                    return a.protected ? -1 : 1;
                }
            })
        });
    }
};

export default Cached;
