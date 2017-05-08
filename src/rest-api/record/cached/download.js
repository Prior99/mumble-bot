import * as Winston from "winston";
import * as FS from "fs";
import HTTPCodes from "../../http-codes";

/**
 * This view handles the downloading of cached records.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const DownloadCached = function(bot) {
    return function(req, res) {
        if(req.body.id) {
            const sound = bot.getCachedAudioById(+req.body.id);
            const stream = FS.createReadStream(sound.file)
            .on("error", (err) => {
                if(err.code === "ENOENT") {
                    res.status(HTTPCodes.notFound).send({
                        reason : "no_such_cached_record"
                    });
                }
                else {
                    Winston.error(`Error occured when trying to read cached record with id ${req.body.id}`);
                    res.status(HTTPCodes.internalError).send({
                        reason : "internal_error"
                    });
                }
            }).on("readable", async () => {
                try {
                    res.status(HTTPCodes.okay).setHeader(
                        "Content-disposition", `attachment; filename='cached_${req.body.id}.mp3'`
                    );
                    stream.pipe(res);
                }
                catch(err) {
                    res.status(HTTPCodes.internalError).send({
                        reason : "internal_error"
                    });
                    Winston.error(
                        "Error occured when trying to fetch data about record to download from database",
                        req.body.id
                    );
                }
            });
        }
        else {
            res.status(HTTPCodes.missingArguments).send({
                reason : "missing_arguments"
            });
        }
    };
};

export default DownloadCached;
