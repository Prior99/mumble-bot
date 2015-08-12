var Winston = require('winston');
var Multer = require('multer');
var FS = require('fs');
module.exports = function(bot, router) {

	router.use(Multer({
		dest: bot.options.website.tmp,
		rename : function(fieldname, filename) {
			return filename + Date.now();
		}
	}));

	function handleFile(file, res) {
		try {
			FS.mkdirSync("sounds/uploaded");
		}
		catch(e) {
			if(e.code !== "EEXIST") {
				throw e;
			}
		}
		bot.database.addSound(file.originalname, function(err, id) {
			if(err) {
				Winston.error("Could not add sound to database", err);
				res.status(500).send({
					okay : false,
					reason : "internal_error"
				});
			}
			else {
				Winston.log('verbose', req.session.user.username + " added new sound #" + id);
				FS.renameSync(file.path, "sounds/uploaded/" + id);
				res.status(200).send({
					okay :true,
					id : id
				});
			}
		});
	}

	return function(req, res) {
		handleFile(req.files["upload"], res);
	};
};
