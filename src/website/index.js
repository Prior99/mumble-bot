/*
 * Imports
 */

var Express = require('express');
var ExpHbs  = require('express-handlebars');
var Winston = require('winston');
var Less = require('less-middleware');
var Session = require('express-session');
var FileStore = require('session-file-store')(Session);
var Moment = require('moment');
var ExpressWS = require('express-ws');
var colorify = require('../colorbystring');
/*
 * Views
 */

var viewDefault = require('./default');
var viewSpeak = require('./speak');
var viewRegisterLogin = require('./users/registerLogin');
var viewLog = require('./log');
var viewQueue = require('./queue');
var viewRSS = require('./rss');

var websocketCached = require("./record/websocketcached");

/*
 * Routes
 */
var routeMusic = require('./music');
var routeApi = require('./api');
var routeQuotes = require('./quotes');
var routeUsers = require('./users');
var routeBass = require('./bass');
var routeRecord = require('./record');
var routeSounds = require('./sounds');

/*
 * Code
 */

var pages = [{
	url : "/quotes/",
	name : "Zitate",
	icon : "commenting"
},
{
	url : "/users/",
	name : "Benutzer",
	icon : "group"
},
{
	url : "/bass/",
	name : "Bass",
	icon : "play-circle"
},
{
	url : "/record/",
	name : "Aufnahmen",
	icon : "microphone"
},
{
	url : "/sounds/",
	name : "Sounds",
	icon : "volume-down"
},
{
	url : "/",
	name : "Sonstiges",
	icon : "dashboard"
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
},
{
	url : "/speak/",
	name : "Sprich!",
	icon : "comment"
},
{
	url : "/google/",
	name : "Google Instant",
	icon : "google"
},
{
	url : "/log/",
	name : "Log",
	icon : "file-text"
},
{
	url : "/queue/",
	name : "Queue",
	icon : "road"
},
{
	url : "/rss/",
	name : "RSS Feeds",
	icon : "rss"
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
			name : "Musik",
			icon : "music"
		});
	}
	this.app = Express();
	ExpressWS(this.app);
	this.app.engine('.hbs', ExpHbs({
		defaultLayout : 'main',
		extname: '.hbs',
		helpers : {
			"colorify" : function(string) {
				return colorify(string);
			},
			"formatDate" : function(date) {
				return Moment(date).format("DD.MM.YY");
			},
			"formatTime" : function(date) {
				return Moment(date).format("HH:mm");
			},
			"isSpeech" : function(a, block) {
				return a.type == "speech" ? block.fn(this) : undefined;
			},
			"isSound" : function(a, block) {
				return a.type == "sound" ? block.fn(this) : undefined;
			},
			"bootstrapClassByLogLevel" : function(level) {
				if(level === "info") {
					return 'success';
				}
				else if(level === "warn") {
					return 'warning';
				}
				else if(level === "error") {
					return 'danger';
				}
				else {
					return '';
				}
			},
			"bootstrapClassIfProtected" : function(audio) {
				if(audio.protected) {
					return 'warning';
				}
				else {
					return '';
				}
			}
		}
	}));
	this.app.set('view engine', '.hbs');
	this.bot = bot;
	this.app.use(Session({
		secret: bot.options.website.sessionSecret,
		store: new FileStore({
			path : "session-store",
			ttl : 315569260,
			retries : 3,
			minTimeout : 200,
			maxTimeout : 1000
		}),
		resave: false,
		saveUninitialized: true
	}));
	this.app.use(function(req, res, next) {
		res.locals.bot = bot;
		res.locals.pages = pages;
		res.locals.session = req.session;
		res.locals.subpages = subpages;
		if(req.session.user) {
			bot.permissions.listPermissionsAssocForUser(req.session.user, function(permissions) {
				res.locals.userPermissions = permissions;
				next();
			});
		}
		else {
			next();
		}
	});
	this.app.use('/bootstrap', Express.static('node_modules/bootstrap/dist/'));
	this.app.use('/fontawesome', Express.static('node_modules/font-awesome/'));
	this.app.use('/typeahead', Express.static('node_modules/typeahead.js/dist/'));
	this.app.use('/bootswatch', Express.static('node_modules/bootswatch/'));
	this.app.use('/typeahead-bootstrap', Express.static('node_modules/typeahead.js-bootstrap3.less/'));
	this.app.use('/tablesorter', Express.static('node_modules/tablesorter/dist/'));
	this.app.use('/favicon.ico', Express.static('favicon.ico'));
	this.app.use('/dist/', Express.static('dist/'));
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
	this.app.use('/bass', routeBass(bot));
	this.app.use('/record', routeRecord(bot));
	this.app.ws('/record/cached', websocketCached(bot));
	this.app.use('/quotes', routeQuotes(bot));
	this.app.use('/sounds', routeSounds(bot));
	this.app.use('/commands', viewDefault("commands"));
	this.app.get('/tree', viewDefault("channeltree"));
	this.app.get('/', viewDefault("home"));
	this.app.get('/speak', viewSpeak(bot));
	this.app.get('/google', viewDefault("googlelookup"));
	this.app.get('/log', viewLog(bot));
	this.app.get('/queue', viewQueue(bot));
	this.app.get('/rss', viewRSS(bot));
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
