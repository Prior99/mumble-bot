/*
 * Imports
 */

var Express = require('express');
var ExpHbs  = require('express-handlebars');
var Winston = require('winston');

/*
 * Views
 */

var viewDefault = require('./default');

/*
 * Routes
 */
var routeMusic = require('./music/music');
var routeApi = require('./api/api');

/*
 * Code
 */

var pages = [{
	url : "/music/",
	name : "Music"
},
{
	url : "/",
	name : "Overview"
}];

var subpages = [{
	url : "tree",
	name : "Channels",
	icon : "sitemap"
}];

var Website = function(bot) {
	this.app = Express();
	this.app.engine('.hbs', ExpHbs({
		defaultLayout : 'main',
		extname: '.hbs'
	}));
	this.app.set('view engine', '.hbs');
	this.bot = bot;
	this.app.use(function(req, res, next) {
		res.locals.bot = bot;
		res.locals.pages = pages;
		res.locals.subpages = subpages;
		next();
	});
	this.app.use('/', Express.static('public/'));
	this.app.use('/bootstrap', Express.static('node_modules/bootstrap/dist/'));
	this.app.use('/jquery', Express.static('node_modules/jquery/dist/'));
	this.app.use('/fontawesome', Express.static('node_modules/font-awesome/'));
	this.app.use('/music', routeMusic(bot));
	this.app.use('/api', routeApi(bot));
	this.app.get('/', viewDefault("home"));
	this.app.get('/tree', viewDefault("channeltree"));
	var port = this.bot.options.website.port;
	this.app.listen(port);
	Winston.info("Module started: Website, listening on port " + port);
};

module.exports = Website;
