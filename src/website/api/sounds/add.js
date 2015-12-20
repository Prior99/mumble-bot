import * as Winston from "winston";
import Multer from "multer";
import * as FS from "fs";
import * as HTTPCodes from "../../httpcodes";

/**
 * View for playback endpoint of sound section.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @param {object} router - Express router this view is connected to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewSoundAdd = function(bot, router) {
	router.use(Multer({
		dest: bot.options.website.tmp,
		rename(fieldname, filename) {
			return filename + Date.now();
		}
	}));

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
			FS.mkdirSync("sounds/uploaded");
		}
		catch(e) {
			if(e.code !== "EEXIST") {
				throw e;
			}
		}
		try {
			const id = await bot.database.addSound(file.originalname);
			Winston.log("verbose", "added new sound #" + id);
			FS.renameSync(file.path, "sounds/uploaded/" + id);
			res.status(HTTPCodes.okay).send({
				okay : true,
				id
			});
		}
		catch(err) {
			Winston.error("Could not add sound to database", err);
			res.status(HTTPCodes.internalError).send({
				okay : false,
				reason : "internal_error"
			});
		}
	}

	return function(req, res) {
		handleFile(req.files["upload"], res, req);
	};
};

export default ViewSoundAdd;
