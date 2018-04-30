import * as Express from "express";
import * as FS from "fs";
import { Request, Response } from "express";
import * as ExpressWS from "express-ws";
import * as BodyParser from "body-parser";
import { Server } from "http";
import { Connection } from "typeorm";
import { component, inject, initialize, TSDI, destroy } from "tsdi";
import { info, error } from "winston";
import { bind } from "bind-decorator";
import { createReadStream, existsSync } from "fs-extra";
import { omit } from "ramda";
import { hyrest } from "hyrest/middleware";
import { AuthorizationMode, configureController, ControllerMode } from "hyrest";
import * as morgan from "morgan";
import { ServerConfig } from "../../config";
import { allControllers, Sound, Token, convertWorkItem, Context, getAuthTokenId } from "../../common";
import { AudioCache, AudioOutput } from "..";

import { cors, catchError } from "./middlewares";

@component
export class RestApi {
    @inject private audioOutput: AudioOutput;
    @inject private db: Connection;
    @inject private config: ServerConfig;
    @inject private cache: AudioCache;

    @inject private tsdi: TSDI;

    private connections = new Set<any>();
    public app: Express.Application;
    private server: Server;

    public serve() {
        const port = this.config.port;
        this.server = this.app.listen(port);

        this.server.setTimeout(10000, () => { return; });
        this.server.on("connection", (conn) => this.onConnection(conn));

        info(`Api started, listening on port ${port}`);
    }

    @initialize
    protected initialize() {
        configureController(
            allControllers,
            { mode: ControllerMode.SERVER },
        );
        this.app = Express();
        this.app.use(BodyParser.json({ limit: "100mb" }));
        this.app.use(BodyParser.urlencoded({ limit: "100mb", extended: true }));
        this.app.use(morgan("tiny", { stream: { write: msg => info(msg.trim()) } }));
        this.app.use(cors);
        this.app.use(catchError);
        ExpressWS(this.app);

        this.app.use(this.handleCORS);
        (this.app as any).ws("/queue", this.websocketQueue);
        (this.app as any).ws("/cached/live", this.websocketQueue);
        this.app.use(
            hyrest(...allControllers.map((controller: any) => this.tsdi.get(controller)))
                .context(req => new Context(req))
                .defaultAuthorizationMode(AuthorizationMode.AUTH)
                .authorization(async req => {
                    const id = getAuthTokenId(req);
                    if (!id) { return false; }
                    const token = await this.tsdi.get(Connection).getRepository(Token).findOne(id);
                    if (!token) { return false; }
                    if (token.deleted) { return false; }
                    return true;
                }),
        );
        this.app.get("/cached/:id/download", this.downloadCached);
        this.app.get("/cached/:id/visualized", this.downloadVisualizedCached);
        this.app.get("/sound/:id/download", this.downloadSound);
        this.app.get("/sound/:id/visualized", this.downloadVisualizedSound);

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
     * Stop the api immediatly.
     * @return Promise which will be resolved when the website has been shut down.
     */
    @destroy
    public stop() {
        return new Promise((resolve, reject) => {
            if (!this.server) { return; }
            this.server.close(() => {
                info(`Terminating ${this.connections.size} open websocket connections.`);
                for (const socket of this.connections) {
                    socket.destroy();
                    this.connections.delete(socket);
                }
                info("Api stopped.");
                resolve();
            });
        });
    }

    @bind public websocketCached(ws, req: Request) {
        ws.send(JSON.stringify({
            type: "init",
            cacheAmount: this.cache.cacheAmount,
            list: this.cache.all.map(sound => omit(["file"], sound)),
        }));

        const onAdd = audio => ws.send(JSON.stringify({ type: "add", sound: omit(["file"], audio) }));
        this.cache.on("cached-audio", onAdd);

        const onRemoveAudio = ({ id }) => ws.send(JSON.stringify({ type: "remove", id }));
        this.cache.on("removed-cached-audio", onRemoveAudio);

        const onProtect = ({ id }) => ws.send(JSON.stringify({ type: "protect", id }));
        this.cache.on("protect-cached-audio", onProtect);

        ws.on("close", () => {
            this.cache.removeListener("cached-audio", onAdd);
            this.cache.removeListener("removed-cached-audio", onRemoveAudio);
            this.cache.removeListener("protect-cached-audio", onProtect);
        });
    }

    @bind public websocketQueue(ws, req: Request) {
        try {
            ws.send(JSON.stringify({
                type: "init",
                queue: this.audioOutput.workItemQueue.map(convertWorkItem),
            }));
        }
        catch (err) {
            error("Error sending initial packet to live queue websocket:", err);
        }
        const onEnqueue = (workitem) => {
            ws.send(JSON.stringify({
                type: "enqueue",
                workitem: convertWorkItem(workitem),
            }));
        };
        const onDequeue = () => {
            ws.send(JSON.stringify({
                type: "dequeue",
            }));
        };
        const onClear = () => {
            ws.send(JSON.stringify({
                type: "clear",
            }));
        };
        this.audioOutput.on("clear", onClear);
        this.audioOutput.on("enqueue", onEnqueue);
        this.audioOutput.on("dequeue", onDequeue);
        ws.on("close", () => {
            this.audioOutput.removeListener("clear", onClear);
            this.audioOutput.removeListener("enqueue", onEnqueue);
            this.audioOutput.removeListener("dequeue", onDequeue);
        });
    }

    @bind public downloadCached({ params }: Request, res: Response) {
        const { id } = params;
        const sound = this.cache.byId(id);
        if (!sound) { return res.status(404).send(); }

        res.setHeader("Content-disposition", `attachment; filename='cached_${id}.mp3'`);
        const stream = FS.createReadStream(sound.file)
            .on("error", (err) => {
                if (err.code === "ENOENT") { return res.status(404).send(); }
                error(`Error occured when trying to read cached record with id ${id}`);
            })
            .on("readable", () => {
                try { stream.pipe(res); }
                catch (err) { error("Error occured when trying to stream file to browser", id, err); }
            });
    }

    @bind public async downloadVisualizedCached({ params }: Request, res: Response) {
        const { id } = params;
        const sound = this.cache.byId(id);
        if (!sound) { return res.status(404).send(); }

        const fileName = `${sound.file}.png`;
        const trySend = async (retries = 0) => {
            if (!existsSync(fileName)) {
                if (retries === 5) { return res.status(404).send(); }
                setTimeout(() => trySend(retries + 1), 500);
                return;
            }
            try {
                res.status(200);
                createReadStream(fileName).on("error", (err) => {
                    res.status(500).send();
                    error(`Error sending visualization of ${sound.file} to client.`, err);
                }).pipe(res);
            }
            catch (err) {
                error("Error occured during request of sound visualization.", err);
                return res.status(500).send();
            }
        };

        await trySend();
    }

    @bind public async downloadSound({ params }: Request, res: Response) {
        const { id } = params;
        const sound = await this.db.getRepository(Sound).findOne(id);
        if (!sound) { return res.status(404).send(); }

        const fileName = `${this.config.soundsDir}/${sound.id}`;
        if (!existsSync(fileName)) {
            error(`Missing audio file for sound ${sound.id}.`);
            res.status(404).send();
            return;
        }

        res.setHeader("Content-disposition", `attachment; filename='${sound.description}.mp3'`);
        try {
            res.status(200);
            createReadStream(fileName).on("error", (err) => {
                error(`Error sending audio file ${fileName} to client.`, err);
                res.status(500).send();
            }).pipe(res);
        }
        catch (err) {
            error("Error occured during request of sound visualization.", err);
            return res.status(500).send();
        }
    }

    @bind public async downloadVisualizedSound({ params }: Request, res: Response) {
        const { id } = params;
        const sound = await this.db.getRepository(Sound).findOne(id);
        if (!sound) { return res.status(404).send(); }

        const fileName = `${this.config.soundsDir}/${sound.id}.png`;
        if (!existsSync(fileName)) {
            error(`Missing visalization file ${fileName} for sound ${sound.id}.`);
            res.status(404).send();
            return;
        }
        try {
            res.status(200);
            createReadStream(fileName).on("error", (err) => {
                error(`Error sending visualization of ${fileName} to client.`, err);
                res.status(500).send();
            }).pipe(res);
        }
        catch (err) {
            error("Error occured during request of sound visualization.", err);
            return res.status(500).send();
        }
    }
}
