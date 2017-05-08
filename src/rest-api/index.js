import Express from "express";
import * as Winston from "winston";
import Moment from "moment";
import ExpressWS from "express-ws";
import BodyParser from "body-parser";
import colorify from "../colorbystring";
import HTTPCodes from "./http-codes";


import Record from './record';
import Sound from './sound';
import Stats from './stats';
import User from './user';

import ChannelTree from './channel-tree';
import Log from './log';
import WebsocketQueue from './websocket-queue';

const maxPercent = 100;

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
        this.app.use(BodyParser.json());
        this.app.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
            if (req.method === "OPTIONS") {
                res.sendStatus(200);
                return;
            }
            next();
        });
        this.app.use(async (req, res, next) => {
            if (req.headers.authorization) {
                if (req.headers.authorization.substr(0, 5).toLowerCase() !== "basic") {
                    res.status(HTTPCodes.forbidden).send({
                        reason: "invalid_authorization_method"
                    });
                    return;
                }
                const token = new Buffer(req.headers.authorization.substr(6), 'base64').toString('utf8');
                const [username, password] = token.split(':');
                if (await bot.database.checkLoginData(username, password)) {
                    try {
                        const user = await bot.database.getUserByUsername(username); // refresh user each session
                        const permissions = await bot.permissions.listPermissionsAssocForUser(user);
                        req.login = true;
                        req.user = user;
                        req.permissions = permissions;
                    } catch(err) {
                        Winston.error(`Error when loading data for user ${username}`, err);
                        res.status(HTTPCodes.internalError).send({
                            reason: "internal_error"
                        });
                    }
                    return next();
                } else {
                    Winston.verbose(`User '${username}' failed to login.`);
                    res.status(HTTPCodes.forbidden).send({
                        reason: "invalid_login"
                    });
                    return;
                }
            }
            res.status(HTTPCodes.forbidden).send({
                reason: "authorization_required"
            });
        });
        this.app.use("/sound", Sound(bot));
        this.app.use("/record", Record(bot));
        this.app.use("/stats", Stats(bot));
        this.app.use("/user", User(bot));
        this.app.get("/channelTree", ChannelTree(bot));
        this.app.get("/log", Log(bot));
        this.app.ws("/queue", WebsocketQueue(bot));

        const port = bot.options.website.port;
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

export default Api;
