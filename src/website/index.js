import Express from "express";
import ExpHbs from "express-handlebars";
import * as Winston from "winston";
import Less from "less-middleware";
import Session from "express-session";
import SessionFileStore from "session-file-store";
import Moment from "moment";
import ExpressWS from "express-ws";
import colorify from "../colorbystring";
import websocketCached from "./record/websocketcached";

import ViewDefault from "./default";
import ViewSpeak from "./speak";
import ViewRegisterLogin from "./users/registerLogin";
import ViewLog from "./log";
import ViewQueue from "./queue";
import ViewRSS from "./rss";


import RouteMusic from "./music";
import RouteApi from "./api";
import RouteQuotes from "./quotes";
import RouteUsers from "./users";
import RouteBass from "./bass";
import RouteRecord from "./record";
import RouteSounds from "./sounds";
import RouteStats from "./stats";
import RouteSpotify from "./spotify";

const FileStore = SessionFileStore(Session);

const pages = [
	{
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
	},
	{
		url : "/stats",
		name : "Statistiken",
		icon : "pie-chart"
	}
];

const subpages = [
	{
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
	}
];

/**
 * TODO
 */
class Website {
	/**
	 * Handles the whole website stuff for the bot. Using express and handlebars
	 * provides the backend for all data and the interface between the webpage and
	 * the bot itself.
	 * @constructor
	 * @param {Bot} bot - The bot to use this webpage with.
	 */
	constructor(bot) {
		if(bot.options.mpd) {
			pages.unshift({
				url : "/music/",
				name : "Musik",
				icon : "music"
			});
		}
		if(bot.options.rss) {
			subpages.unshift({
				url : "/rss/",
				name : "RSS Feeds",
				icon : "rss"
			});
		}
		this.app = Express();
		ExpressWS(this.app);
		this.app.engine(".hbs", ExpHbs({
			defaultLayout : "main",
			extname: ".hbs",
			helpers : {
				"colorify" : string => colorify(string),
				"formatDate" : date => Moment(date).format("DD.MM.YY"),
				"formatTime" : date => Moment(date).format("HH:mm"),
				"isSpeech" : function(a, block) { //eslint-disable-line object-shorthand
					return a.type === "speech" ? block.fn(this) : undefined;
				},
				"isSound" : function(a, block) { //eslint-disable-line object-shorthand
					return a.type === "sound" ? block.fn(this) : undefined;
				},
				"bootstrapClassByLogLevel" : level => {
					if(level === "info") {
						return "success";
					}
					else if(level === "warn") {
						return "warning";
					}
					else if(level === "error") {
						return "danger";
					}
					else {
						return "";
					}
				},
				"bootstrapClassIfProtected" : audio => audio.protected ? "warning" : ""
			}
		}));
		this.app.set("view engine", ".hbs");
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
		this.app.use(async (req, res, next) => {
			res.locals.bot = bot;
			res.locals.pages = pages;
			res.locals.session = req.session;
			res.locals.subpages = subpages;
			if(req.session.user) {
				const permissions = await bot.permissions.listPermissionsAssocForUser(req.session.user);
				res.locals.userPermissions = permissions;
				next();
			}
			else {
				next();
			}
		});
		this.app.use("/bootstrap", Express.static("node_modules/bootstrap/dist/"));
		this.app.use("/fontawesome", Express.static("node_modules/font-awesome/"));
		this.app.use("/typeahead", Express.static("node_modules/typeahead.js/dist/"));
		this.app.use("/bootswatch", Express.static("node_modules/bootswatch/"));
		this.app.use("/typeahead-bootstrap", Express.static("node_modules/typeahead.js-bootstrap3.less/"));
		this.app.use("/tablesorter", Express.static("node_modules/tablesorter/dist/"));
		this.app.use("/favicon.ico", Express.static("favicon.ico"));
		this.app.use("/dist/", Express.static("dist/"));
		this.app.use("/api", RouteApi(bot));
		this.app.use((req, res, next) => {
			if(req.session.user) {
				next();
			}
			else {
				return ViewRegisterLogin(bot)(req, res);
			}
		});
		this.app.use("/music", RouteMusic(bot));
		this.app.use("/users", RouteUsers(bot));
		this.app.use("/bass", RouteBass(bot));
		this.app.use("/record", RouteRecord(bot));
		this.app.ws("/record/cached", websocketCached(bot));
		this.app.use("/quotes", RouteQuotes(bot));
		this.app.use("/sounds", RouteSounds(bot));
		this.app.use("/stats", RouteStats(bot));
		this.app.use("/commands", ViewDefault("commands"));
		this.app.get("/tree", ViewDefault("channeltree"));
		this.app.get("/", ViewDefault("home"));
		this.app.get("/speak", ViewSpeak(bot));
		this.app.get("/google", ViewDefault("googlelookup"));
		this.app.get("/log", ViewLog(bot));
		this.app.get("/queue", ViewQueue(bot));
		this.app.get("/rss", ViewRSS(bot));
		this.app.use("/spotify", RouteSpotify(bot));
		const port = this.bot.options.website.port;
		this.server = this.app.listen(port);
		const timeoutValue = 5000;
		this.server.setTimeout(timeoutValue);
		Winston.info("Module started: Website, listening on port " + port);
	}

	/**
	 * Stop the webpage immediatly.
	 * @return {Promise} - Promise which will be resolved when the website has been shut down.
	 */
	shutdown() {
		return new Promise((resolve, reject) => {
			Winston.info("Stopping module: Website ...");
			this.server.close(() => {
				Winston.info("Module stopped: Website.");
				resolve();
			});
		});
	}
}

export default Website;
