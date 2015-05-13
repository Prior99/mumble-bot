/*
 * Imports
 */
var Multer = require('multer');
var MusicMetadata = require('musicmetadata');
var FS = require('fs');
var Winston = require('winston');
/*
 * Code
 */

var Upload = function(bot, router, req, res) {

	this.status = {};
	//this.req;
	//this.res;
	//this.fileAmount;
	this.bot = bot;
	this.req = req;
	this.res = res;
	var files;
	if(Object.prototype.toString.call(req.files["upload[]"]) === "[object Array]") {
		files = req.files["upload[]"];
	}
	else {
		files = [ req.files["upload[]"] ];
	}
	for(var key in files) {
		this.handleFile(files[key]);
	}
};

Upload.prototype.updateComplete = function(err, file, metadata) {
	if(err) {
		console.log(err);
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
};

Upload.prototype.handleFile = function(file) {
	MusicMetadata(FS.createReadStream(file.path), function(err, metadata) {
		if(!err && metadata.title && metadata.artist && metadata.artist[0]) {
			FS.renameSync(file.path, this.bot.options.mpd.directory + "/" + metadata.artist[0] + " - " + metadata.title + "." + file.extension);
			this.bot.mpd.mpd.updateSongs(function(err) {
				this.updateComplete(err, file, metadata)
			}.bind(this));
		}
		else {
			var reason;
			if(err) { reason = "internal_error"; }
			else { reason = "no_id3_tag"; }
			this.status[file.originalname] = {
				okay : false,
				reason: reason
			};
			this.checkDone();
		}
	}.bind(this));
};

Upload.prototype.done = function() {
	this.res.send(JSON.stringify(this.status));
};

Upload.prototype.checkDone = function() {
	if(this.req) {
		var len1 = 0;
		var len2;
		var files = this.req.files["upload[]"];
		if(Object.prototype.toString.call(files) === "[object Array]") {
			len2 = files.length;
		}
		else {
			len2 = 1;
		}
		for(var key in this.status) {
			len1 ++;
		}
		if(len2 == len1) {
			this.done();
		}
	}
	else console.log("No req.");
};



module.exports = function(bot, router) {
	router.use(Multer({
		dest: bot.options.website.tmp,
		rename : function(fieldname, filename) {
			return filename + Date.now();
		}
	}));
	return function(req, res) {
		new Upload(bot, router, req, res);
	}
};
