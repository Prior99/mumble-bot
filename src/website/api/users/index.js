/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewAvailable = require('./usernameavailable');
var viewSteam64Id = require('./steam64id');
var viewRegister = require('./register');
var viewLogin = require('./login');
var viewLogout = require('./logout');
var viewPermissions = require('./permissions');
var viewGrant = require('./grantpermission');
var viewRevoke = require('./revokepermission');
/*
 * Code
 */

module.exports = function(bot) {
	var router = Express.Router();
	router.use('/usernameAvailable', viewAvailable(bot));
	router.use('/steam64id', viewSteam64Id());
	router.use('/register', viewRegister(bot));
	router.use('/login', viewLogin(bot));
	router.use('/logout', viewLogout());
	router.use('/permissions', viewPermissions(bot));
	router.get('/grantPermission', viewGrant(bot));
	router.get('/revokePermission', viewRevoke(bot));
	return router;
};
