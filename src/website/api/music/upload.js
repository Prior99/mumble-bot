/*
 * Imports
 */
import Multer from "multer";
import MusicMetadata from "musicmetadata";
import * as FS from "fs";
import * as Winston from "winston";

/*
 * Code
 */

/**
 * This class handles the upload of a song.
 */
class Upload {
	/**
	 * @constructor
	 * @param {Bot} bot - The instance this upload belongs to.
	 * @param {object} router - The express router the endpoint is connected to.
	 * @param {object} req - The original request from express.
	 * @param {object} res - The original response from express to answer.
	 */
	constructor(bot, router, req, res) {
		this.status = {
			okay : true
		};
		this.bot = bot;
		this.req = req;
		this.res = res;
		let files;
		if(Object.prototype.toString.call(req.files["upload[]"]) === "[object Array]") {
			files = req.files["upload[]"];
		}
		else {
			files = [ req.files["upload[]"] ];
		}
		for(const file of files) {
			this.handleFile(file);
		}
	}

	/**
	 * Called when the update of MPDs database was completed.
	 * @param {object} err - If an error occured this will not be null, an error will be logged
	 *                       and an appropriate response will be sent.
	 * @param {object} file - The file to use.
	 * @param {string} file.originalname - The original name of the file.
	 * @param {object} metadata - The metadata from the analyzation.
	 * @param {string[]} metadata.artist - List of artist that created the song. Only the first one will be used.
	 * @param {string} metadata.title - Title of the song.
	 * @return {undefined}
	 */
	updateComplete(err, file, metadata) {
		if(err) {
			Winston.error(err);
			this.status[file.originalname] = {
				okay : false,
				reason: "internal_error"
			};
		}
		else {
			this.status[file.originalname] = { okay : true };
			Winston.info("New song in library: " + metadata.artist[0] + " - " + metadata.title);
		}
		this.checkDone();
	}

	/**
	 * Handle an uploaded file. Analyze the metadata and update MPD.
	 * @param {string} file - The file that was uploaded.
	 * @return {undefined}
	 */
	handleFile(file) {
		MusicMetadata(FS.createReadStream(file.path), (err, metadata) => {
			if(!err && metadata.title && metadata.artist && metadata.artist[0]) {
				const filename = this.bot.options.mpd.directory + "/" +
					metadata.artist[0] + " - " + metadata.title + "." + file.extension;
				FS.renameSync(file.path, filename);
				this.bot.mpd.mpd.updateSongs((err) => this.updateComplete(err, file, metadata));
			}
			else {
				let reason;
				if(err) { reason = "internal_error"; }
				else { reason = "no_id3_tag"; }
				this.status[file.originalname] = {
					okay : false,
					reason
				};
				this.checkDone();
			}
		});
	}

	/**
	 * Called when everything is done and a positive response can be sent.
	 * @return {undefined}
	 */
	done() {
		this.res.send(this.status);
	}

	/**
	 * Checks whether the upload of all files was done or not and calls done() when everything was alright.
	 * @return {undefined}
	 */
	checkDone() {
		if(this.req) {
			let len1 = 0;
			let len2;
			const files = this.req.files["upload[]"];
			if(Object.prototype.toString.call(files) === "[object Array]") {
				len2 = files.length;
			}
			else {
				len2 = 1;
			}
			for(const key in this.status) {
				if(this.status.hasOwnProperty(key)) {
					len1++;
				}
			}
			if(len2 === len1) {
				this.done();
			}
		}
	}
}

/**
 * This view handels uploading a song to the MPDs song database.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @param {object} router - The express router this endpoint is connected to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewUpload = function(bot, router) {
	router.use(Multer({
		dest: bot.options.website.tmp,
		rename(fieldname, filename) {
			return filename + Date.now();
		}
	}));
	return function(req, res) {
		bot.permissions.hasPermission(req.session.user, "upload-music", (has) => {
			if(has) {
				new Upload(bot, router, req, res);
			}
			else {
				res.send({
					okay : false,
					reason: "insufficient_permission"
				});
			}
		});
	}
};

export default ViewUpload;
