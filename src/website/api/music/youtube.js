/*
 * Imports
 */
import * as FS from "fs";
import * as YoutubeDl from "youtube-dl";
import * as MusicMetadata from "musicmetadata";
import * as Winston from "winston";
/*
 * Code
 */

let bot;

/**
 * Abort the download, clean up the temporary file, log a warning and send the response.
 * @param {object} res - The response from express to answer.
 * @param {string} filename - Name of the temporary file to delete.
 * @return {undefined}
 */
const abort = function(res, filename) {
	if(filename) {
		FS.unlink(filename, (err) => {
			if(err) {
				Winston.warn("Could not delete temp file from youtube extraction: " + filename);
			}
		});
	}
	res.send(JSON.stringify(r));
}

/**
 * Called when the update is complete. Logs the success and sends the positive response.
 * @param {object} err - If an error occured this is not null. The error will be logged
 *                       and a respective response will be sent.
 * @param {object} res - The response from express that should be answered.
 * @param {string} artist - Artist of the song.
 * @param {string} title - Title of the song.
 * @param {string} file - Name of the file to save.
 * @return {undefined}
 */
const updateComplete = function(err, res, artist, title, file) {
	if(err) {
		Winston.error(err);
		abort(res, file, {
			okay : false,
			reason: "internal_error"
		});
	}
	else {
		Winston.info("New song in library: " + artist + " - " + title);
		res.send(JSON.stringify({
			okay : true,
			artist,
			title
		}));
	}
}

/**
 * Called when the metadata is fully analyzed.
 * @param {object} err - If an error has occured this will not be null and the process will be aborted.
 * @param {object} metadata - The result of analyzing the metadata.
 * @param {string[]} metadata.artist - An array of artists that worked on this song.
 *                                     Only the first one will be taken into account.
 * @param {string} metadata.title - The title of the song.
 * @param {string} tmpAudioName - The name of the temporary file.
 * @param {object} res - The response object from express to answer.
 * @return {undefined}
 */
const metadataAnalyzed = function(err, metadata, tmpAudioName, res) {
	if(err) {
		abort(res, tmpAudioName, {
			okay : false,
			reason: "error_fetching_metadata"
		});
	}
	else {
		if(metadata.title && metadata.artist) {
			const filename = bot.options.mpd.directory + "/" + metadata.artist[0] + " - " + metadata.title + ".mp3";
			FS.renameSync(tmpAudioName, filename);
			bot.mpd.mpd.updateSongs((err) => updateComplete(err, res, metadata.artist[0], metadata.title));
		}
		else {
			abort(res, tmpAudioName, {
				okay : false,
				reason: "missing_metadata"
			});
		}
	}
}

/**
 * Called when the initial download of the video was finished.
 * @param {object} err - If an error has occured during the download this wont be null and everything will be aborted.
 * @param {string} output - The output of youtube-dl to stdout.
 * @param {string} tmpAudioName - Name of the temporary file.
 * @param {object} res - The response object from express to answer.
 * @return {undefined}
 */
const downloadFinished = function(err, output, tmpAudioName, res) {
	if(err) {
		abort(res, tmpAudioName, {
			okay : false,
			reason: "error_while_downloading"
		});
	}
	else {
		MusicMetadata(FS.createReadStream(tmpAudioName), (err, metadata) => {
			metadataAnalyzed(err, metadata, tmpAudioName, res);
		});
	}
}

/**
 * This view handels downloading a youtube video into an mp3 song.
 * @param {Bot} b - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewYoutube = function(b) {
	bot = b;
	return function(req, res) {
		bot.permissions.hasPermission(req.session.user, "upload-music", (has) => {
			if(has) {
				if(req.query.url) {
					const url = req.query.url;
					let format;
					if(req.format) {
						format = req.format;
					}
					else {
						format = "%(artist)s - %(title)s"
					}
					const tmpName = bot.options.website.tmp + "/youtube" + Date.now();
					const tmpVideoName = tmpName + ".mp4";
					const tmpAudioName = tmpName + ".mp3";
					YoutubeDl.exec(url,
						[
							"--add-metadata",
							"--metadata-from-title", format,
							"-x",
							"--audio-format", "mp3",
							"-o", tmpVideoName
						], {}, (err, output) => downloadFinished(err, output, tmpAudioName, res)
					);
				}
				else {
					res.send(JSON.stringify({
						okay : false,
						reason: "no_url"
					}));
				}
			}
			else {
				res.send(JSON.stringify({
					okay : false,
					reason: "insufficient_permission"
				}));
			}
		});
	}
};

export default ViewYoutube;
