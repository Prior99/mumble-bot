/*
 * Imports
 */

var Express = require('express');
var ExpHbs  = require('express-handlebars');
var Winston = require('winston');
var Less = require('less-middleware');

/*
 * Views
 */

var viewDefault = require('./default');

/*
 * Routes
 */
var routeMusic = require('./music/music');
var routeApi = require('./api/api');
var routeQuotes = require('./quotes/quotes');

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
},
{
	url : "/quotes/",
	name : "Quotes"
}];

var subpages = [{
	url : "/tree/",
	name : "Channels",
	icon : "sitemap"
},
{
	url : "/commands/",
	name : "Commands",
	icon : "cogs"
}];

var Website = function(bot) {
	this.app = Express();
	this.app.engine('.hbs', ExpHbs({
		defaultLayout : 'main',
		extname: '.hbs',
		helpers : {
			"formatDate" : function(date) {
				return date.toLocaleDateString();
			}
		}
	}));
	this.app.set('view engine', '.hbs');
	this.bot = bot;
	this.app.use(function(req, res, next) {
		res.locals.bot = bot;
		res.locals.pages = pages;
		res.locals.subpages = subpages;
		next();
	});
	this.app.use(Less('public/'));
	this.app.use('/', Express.static('public/'));
	this.app.use('/bootstrap', Express.static('node_modules/bootstrap/dist/'));
	this.app.use('/jquery', Express.static('node_modules/jquery/dist/'));
	this.app.use('/fontawesome', Express.static('node_modules/font-awesome/'));
	this.app.use('/music', routeMusic(bot));
	this.app.use('/api', routeApi(bot));
	this.app.use('/quotes', routeQuotes(bot));
	this.app.use('/commands', viewDefault("commands"));
	this.app.get('/tree', viewDefault("channeltree"));
	this.app.get('/', viewDefault("home"));
	var port = this.bot.options.website.port;
	this.server = this.app.listen(port);
	this.server.setTimeout(5000);
	Winston.info("Module started: Website, listening on port " + port);
};

Website.prototype.shutdown = function(callback) {
	Winston.info("Stopping module: Website ...");
	this.server.close(function() {
		Winston.info("Module stopped: Website.");
		callback();
	});
};

module.exports = Website;
