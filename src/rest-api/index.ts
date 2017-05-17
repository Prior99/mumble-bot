import * as Express from "express";
import * as Winston from "winston";
import ExpressWS = require("express-ws");
import * as BodyParser from "body-parser";
import { colorify } from "../colorbystring";
import * as HTTP from "http-status-codes";
import { Server } from "http";

import { Recordings } from './recordings';
import { Sounds } from './sound';
import { Stats } from './stats';
import { Users } from './users';

import { ChannelTree } from './channel-tree';
import { Log } from './log';
import { Authorized } from './authorized';
import { WebsocketQueue } from './websocket-queue';
import { checkLoginData, getUserByUsername } from "../database";
import { Bot } from "../index";
import { forbidden, internalError, authorizedWebsocket, authorized, notFound } from "./utils";

const maxPercent = 100;

export class Api {
    private connections: Set<any>;
    private app: Express.Application;
    private server: Server;
    private bot: Bot;

    /**
     * Handles the whole website stuff for the bot. Using express and handlebars
     * provides the backend for all data and the interface between the webpage and
     * the bot itself.
     * @constructor
     * @param bot The bot to use this webpage with.
     */
    constructor(bot: Bot) {
        this.bot = bot;
        this.connections = new Set();
        this.app = Express();
        ExpressWS(this.app);
        this.app.use(BodyParser.urlencoded());
        this.app.use(BodyParser.json());
        this.app.use(this.handleCORS);
        this.app.use("/sounds", Sounds(bot));
        this.app.use("/recordings", Recordings(bot));
        this.app.use("/statistics", Stats(bot));
        this.app.use("/users", Users(bot));
        this.app.get("/channel-tree", ChannelTree(bot));
        this.app.get("/log", authorized(Log)(bot));
        this.app.get("/authorized", authorized(Authorized)(bot));
        (this.app as any).ws("/queue", authorizedWebsocket(WebsocketQueue)(bot));
        this.app.use("*", (req, res) => notFound(res));

        const port = bot.options.website.port;
        this.server = this.app.listen(port);

        const timeoutValue = 30000; // 30 seconds timeout
        this.server.setTimeout(timeoutValue, () => {});
        this.server.on("connection", (conn) => this.onConnection(conn));

        Winston.info("Api started, listening on port " + port);
    }

    private handleCORS: Express.Handler = (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        if (req.method === "OPTIONS") {
            res.sendStatus(200);
            return;
        }
        return next();
    }

    /**
     * Called when a new connection was opened by the webserver.
     * @param conn The socket that was opened.
     */
    private onConnection(conn) {
        this.connections.add(conn);
        conn.on("close", () => {
            this.connections.delete(conn);
        });
    }

    /**
     * Stop the webpage immediatly.
     * @return Promise which will be resolved when the website has been shut down.
     */
    public shutdown() {
        return new Promise((resolve, reject) => {
            Winston.info("Stopping website ...");
            this.server.close(() => {
                Winston.info("Terminating " + this.connections.size + " connections.");
                for (const socket of this.connections) {
                    socket.destroy();
                    this.connections.delete(socket);
                }
                Winston.info("Website stopped.");
                resolve();
            });
        });
    }
}
