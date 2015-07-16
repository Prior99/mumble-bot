/*
 * Imports
 */

var Express = require('express');
var ExpHbs  = require('express-handlebars');
var Winston = require('winston');
var Less = require('less-middleware');
var Session = require('express-session');
var FileStore = require('session-file-store')(Session);

/*
 * Views
 */

var viewDefault = require('./default');
var viewRegisterLogin = require('./users/registerLogin');

/*
 * Routes
 */
var routeMusic = require('./music');
var routeApi = require('./api');
var routeQuotes = require('./quotes');
var routeUsers = require('./users');

/*
 * Code
 */

var pages = [{
	url : "/",
	name : "Übersicht"
},
{
	url : "/quotes/",
	name : "Zitate"
},
{
	url : "/users/",
	name : "Benutzer"
}];

var subpages = [{
	url : "/tree/",
	name : "Channel-Struktur",
	icon : "sitemap"
},
{
	url : "/commands/",
	name : "Befehle",
	icon : "cogs"
}];
/**
 * Handles the whole website stuff for the bot. Using express and handlebars
 * provides the backend for all data and the interface between the webpage and
 * the bot itself.
 * @constructor
 * @param {Bot} bot - The bot to use this webpage with.
 */
var Website = function(bot) {
	if(bot.options.mpd) {
		pages.unshift({
			url : "/music/",
			name : "Musik"
		});
	}
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
	this.app.use(Session({
		secret: bot.options.website.sessionSecret,
		store: new FileStore({
			path : "session-store"
		}),
		resave: false,
		saveUninitialized: true
	}));
	this.app.use(function(req, res, next) {
		res.locals.bot = bot;
		res.locals.pages = pages;
		res.locals.session = req.session;
		res.locals.subpages = subpages;
		next();
	});
	this.app.use(Less('public/'));
	this.app.use('/', Express.static('public/'));
	this.app.use('/bootstrap', Express.static('node_modules/bootstrap/dist/'));
	this.app.use('/jquery', Express.static('node_modules/jquery/dist/'));
	this.app.use('/jquery-form', Express.static('node_modules/jquery-form/'));
	this.app.use('/fontawesome', Express.static('node_modules/font-awesome/'));
	this.app.use('/crypto-js', Express.static('node_modules/crypto-js/'));
	this.app.use('/bootstrap-validator', Express.static('node_modules/bootstrap-validator/dist/'));
	this.app.use('/api', routeApi(bot));
	this.app.use(function(req, res, next) {
		if(req.session.user) {
			next();
		}
		else {
			return viewRegisterLogin(bot)(req, res);
		}
	});
	this.app.use('/music', routeMusic(bot));
	this.app.use('/users', routeUsers(bot));
	this.app.use('/quotes', routeQuotes(bot));
	this.app.use('/commands', viewDefault("commands"));
	this.app.get('/tree', viewDefault("channeltree"));
	this.app.get('/', viewDefault("home"));
	var port = this.bot.options.website.port;
	this.server = this.app.listen(port);
	this.server.setTimeout(5000);
	Winston.info("Module started: Website, listening on port " + port);
};

/**
 * Stop the webpage immediatly.
 * @param callback - Will be called once the webpage came to a full stop.
 */
Website.prototype.shutdown = function(callback) {
	Winston.info("Stopping module: Website ...");
	this.server.close(function() {
		Winston.info("Module stopped: Website.");
		callback();
	});
};

module.exports = Website;