/*
 * Imports
 */
var FS = require('fs');
var YoutubeDl = require('youtube-dl');
var MusicMetadata = require('musicmetadata');
var Winston = require('winston');
/*
 * Code
 */
var bot;

function abort(res, filename, r) {
	if(filename) {
		FS.unlink(filename, function(err) {
			if(err) {
				Winston.warn("Could not delete temp file from youtube extraction: " + filename);
			}
		});
	}
	res.send(JSON.stringify(r));
}

function updateComplete(err, res, artist, title, file) {
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
			artist : artist,
			title : title
		}));
	}
}

function metadataAnalyzed(err, metadata, tmpAudioName, res) {
	if(err) {
		abort(res, tmpAudioName, {
			okay : false,
			reason: "error_fetching_metadata"
		});
	}
	else {
		if(metadata.title && metadata.artist) {
			FS.renameSync(tmpAudioName, bot.options.mpd.directory + "/" + metadata.artist[0] + " - " + metadata.title + ".mp3");
			bot.mpd.mpd.updateSongs(function(err) {
				updateComplete(err, res, metadata.artist[0], metadata.title);
			});
		}
		else {
			abort(res, tmpAudioName, {
				okay : false,
				reason: "missing_metadata"
			});
		}
	}
}

function downloadFinished(err, output, tmpAudioName, res) {
	if(err) {
		abort(res, tmpAudioName, {
			okay : false,
			reason: "error_while_downloading"
		});
	}
	else {
		MusicMetadata(FS.createReadStream(tmpAudioName), function(err, metadata) {
			metadataAnalyzed(err, metadata, tmpAudioName, res);
		});
	}
}


module.exports = function(b) {
	bot = b;
	return function(req, res) {
		bot.permissions.hasPermission(req.session.user, "upload-music", function(has) {
			if(has) {
				if(req.query.url) {
					var url = req.query.url;
					var format;
					if(req.format) {
						format = req.format;
					}
					else {
						format = "%(artist)s - %(title)s"
					}
					var tmpName = bot.options.website.tmp + "/youtube" + Date.now();
					var tmpVideoName = tmpName + ".mp4";
					var tmpAudioName = tmpName + ".mp3";
					YoutubeDl.exec(url, ['--add-metadata', '--metadata-from-title', format, '-x','--audio-format', 'mp3', '-o', tmpVideoName], {}, function(err, output) {
						downloadFinished(err, output, tmpAudioName, res);
					});
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
