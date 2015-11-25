/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewRecordsPerUser = require('./recordsperuser');
var viewRecordsPerTime = require('./recordspertime');
var viewSpokenPerHour = require('./spokenperhour');
var viewSpokenPerUser = require('./spokenperuser');
var viewSpokenPerWeekday = require('./spokenperweekday');
var viewOnlinePerUser = require('./onlineperuser');
var viewRecordPlaybacksPerUser = require('./recordplaybacksperuser');

/*
 * Code
 */

module.exports = function(bot) {
	var router = Express.Router();

	router.use('/recordsperuser', viewRecordsPerUser(bot));
	router.use('/recordspertime', viewRecordsPerTime(bot));
	router.use('/spokenperhour', viewSpokenPerHour(bot));
	router.use('/spokenperuser', viewSpokenPerUser(bot));
	router.use('/spokenperweekday', viewSpokenPerWeekday(bot));
	router.use('/onlineperuser', viewOnlinePerUser(bot));
	router.use('/recordplaybacksperuser', viewRecordPlaybacksPerUser(bot));

	return router;
};
