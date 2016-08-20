import Express from "express";
import * as Winston from "winston";
import Moment from "moment";
import ExpressWS from "express-ws";
import colorify from "../colorbystring";
import websocketCached from "./record/websocketcached";
import websocketQueue from "./websocketqueue";

import Record from './record';
import Sound from './sound';
import Stats from './stats';
import User from './user';

import ChannelTree from './channeltree';
import Log from './log';
import WebsocketQueue from './websocketqueue';

const maxPercent = 100;

/**
 * TODO
 */
class Api {
	/**
	 * Handles the whole website stuff for the bot. Using express and handlebars
	 * provides the backend for all data and the interface between the webpage and
	 * the bot itself.
	 * @constructor
	 * @param {Bot} bot - The bot to use this webpage with.
	 */
	constructor(bot) {
		this.connections = new Set();
		this.app = Express();
		ExpressWS(this.app);
		this.bot = bot;
		this.app.use(async (req, res, next) => {
			res.locals.bot = bot;
			if(req.session.user) {
				req.session.user = await bot.database.getUserById(req.session.user.id); // refresh user each session
				const permissions = await bot.permissions.listPermissionsAssocForUser(req.session.user);
				res.locals.userPermissions = permissions;
				next();
			}
			else {
				next();
			}
		});
		this.app.use("/sound", Sound(bot));
		this.app.use("/record", Record(bot));
		this.app.use("/stats", Stats(bot));
		this.app.use("/user", User(bot));
		this.app.get("/channelTree", ChannelTree(bot));
		this.app.get("/log", ChannelTree(bot));
		this.app.ws("/queue", WebsocketQueue(bot));
		const port = this.bot.options.website.port;
		this.server = this.app.listen(port);
		const timeoutValue = 30000; // 30 seconds timeout
		this.server.setTimeout(timeoutValue);
		this.server.on("connection", (conn) => this._onConnection(conn));
		Winston.info("Module started: Api, listening on port " + port);
	}

	/**
	 * Called when a new connection was opened by the webserver.
	 * @param {Socket} conn - The socket that was opened.
	 * @return {undefined}
	 */
	_onConnection(conn) {
		this.connections.add(conn);
		conn.on("close", () => {
			this.connections.delete(conn);
		});
	}

	/**
	 * Stop the webpage immediatly.
	 * @return {Promise} - Promise which will be resolved when the website has been shut down.
	 */
	shutdown() {
		return new Promise((resolve, reject) => {
			Winston.info("Stopping website ...");
			this.server.close(() => {
				Winston.info("Terminating " + this.connections.length + " connections.");
				for(const socket of this.connections) {
					socket.destroy();
					this.connections.delete(socket);
				}
				Winston.info("Website stopped.");
				resolve();
			});
		});
	}
}

export default Website;
