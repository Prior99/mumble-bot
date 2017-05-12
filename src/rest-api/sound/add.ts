import * as Winston from "winston";
import * as Multer from "multer";
import * as FS from "fs";
import * as HTTP from "http-status-codes";
import { addSound } from "../../database";

/**
 * View for playback endpoint of sound section.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @param {object} router - Express router this view is connected to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const SoundAdd = function(bot, router) {
    router.use(Multer({
        dest: bot.options.website.tmp
    }).array());

    /**
     * Handle a file upload.
     * @param {object} file - File from multer.
     * @param {object} file.path - Path of the temporary file.
     * @param {object} file.originalname - Original file name.
     * @param {object} res - Response from express to answer.
     * @return {undefined}
     */
    const handleFile = async function(file, res) {
        try {
            await FS.mkdir("sounds/uploaded");
        }
        catch (e) {
            if (e.code !== "EEXIST") {
                throw e;
            }
        }
        try {
            const id = await addSound(file.originalname, bot.database);
            Winston.log("verbose", `added new sound #${id}`);
            FS.renameSync(file.path, `sounds/uploaded/${id}`);
            res.status(HTTP.OK).send({ id });
        }
        catch (err) {
            Winston.error("Could not add sound to database", err);
            res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                reason: "internal_error"
            });
        }
    }

    return function(req, res) {
        handleFile(req.files["upload"], res);
    };
};

export default SoundAdd;
