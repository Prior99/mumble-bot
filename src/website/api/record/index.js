/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewPlayCached = require('./playcached');
var viewSave = require('./save');
var viewPlay = require('./play');
var viewDownload = require('./download');
var viewDeleteCached = require('./deletecached');
var viewProtect = require('./protect');
var viewAddLabel = require('./addlabel');
var viewEdit = require('./edit');
var viewStats = require('./stats');
var viewRandom = require('./random');

/*
 * Code
 */

module.exports = function(bot) {
	var router = Express.Router();

	router.use('/save', viewSave(bot));
	router.use('/play', viewPlay(bot));
	router.use('/playcached', viewPlayCached(bot));
	router.use('/download', viewDownload(bot));
	router.use('/protect', viewProtect(bot));
	router.use('/deletecached', viewDeleteCached(bot));
	router.use('/addlabel', viewAddLabel(bot));
	router.use('/edit', viewEdit(bot));
	router.use('/stats', viewStats(bot));
	router.use('/random', viewRandom(bot));

	return router;
};
