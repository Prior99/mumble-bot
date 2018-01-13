import * as Express from "express";
import * as FS from "fs";
import { Request, Response } from "express";
import ExpressWS = require("express-ws"); // tslint:disable-line
import mkdirp = require("mkdirp-promise"); // tslint:disable-line
import * as BodyParser from "body-parser";
import { Server } from "http";
import { Connection } from "typeorm";
import { component, inject, initialize } from "tsdi";
import { info, error } from "winston";
import { bind } from "bind-decorator";
import { createReadStream, writeFile, exists } from "async-file";
import { omit } from "ramda";

import { ServerConfig } from "../../config";
import { Recording, convertWorkItem } from "../../common";
import { AudioCache, AudioOutput } from "..";

import { cors, catchError } from "./middlewares";

@component
export class RestApi {
    @inject private audioOutput: AudioOutput;
    @inject private db: Connection;
    @inject private config: ServerConfig;
    @inject private cache: AudioCache;

    private connections = new Set<any>();
    private app: Express.Application;
    private server: Server;

    @initialize
    private start() {
        this.app = Express();
        this.app.use(BodyParser.json({ limit: "100mb" }));
        this.app.use(BodyParser.urlencoded({ limit: "100mb", extended: true }));
        this.app.use(cors);
        this.app.use(catchError);
        ExpressWS(this.app);

        this.app.use(this.handleCORS);
        (this.app as any).ws("/queue", this.websocketQueue);
        (this.app as any).ws("/cached/live", this.websocketQueue);
        this.app.get("/cached/:id/download", this.downloadCached);
        this.app.get("/cached/:id/visualized", this.downloadVisualizedCached);
        this.app.get("/recording/:id/download", this.downloadRecording);
        this.app.get("/recording/:id/visualized", this.downloadVisualizedRecording);

        const port = this.config.port;
        this.server = this.app.listen(port);

        this.server.setTimeout(10000, () => { return; });
        this.server.on("connection", (conn) => this.onConnection(conn));

        info(`Api started, listening on port ${port}`);
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
    public stop() {
        return new Promise((resolve, reject) => {
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
            list: this.cache.all.map(recording => omit(["file"], recording))
        }));

        const onAdd = audio => ws.send(JSON.stringify({ type: "add", recording: omit(["file"], audio) }));
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
                queue: this.audioOutput.workItemQueue.map(convertWorkItem)
            }));
        }
        catch (err) {
            error("Error sending initial packet to live queue websocket:", err);
        }
        const onEnqueue = (workitem) => {
            ws.send(JSON.stringify({
                type: "enqueue",
                workitem: convertWorkItem(workitem)
            }));
        };
        const onDequeue = () => {
            ws.send(JSON.stringify({
                type: "dequeue"
            }));
        };
        const onClear = () => {
            ws.send(JSON.stringify({
                type: "clear"
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
                error(`Error occured when trying to read cached record with id ${id}`);
                if (err.code === "ENOENT") { return res.status(404).send(); }
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
            if (!await exists(fileName)) {
                if (retries === 5) { return res.status(404).send(); }
                setTimeout(() => trySend(retries + 1), 500);
                return;
            }
            try {
                res.status(200);
                createReadStream(fileName).on("error", (err) => {
                    error(`Error sending visualization of ${sound.file} to client.`, err);
                    res.status(500).send();
                }).pipe(res);
            }
            catch (err) {
                error("Error occured during request of sound visualization.", err);
                return res.status(500).send();
            }
        };

        await trySend();
    }

    @bind public async downloadRecording({ params }: Request, res: Response) {
        const { id } = params;
        const recording = await this.db.getRepository(Recording).findOneById(id);
        if (!recording) { return res.status(404).send(); }

        res.setHeader("Content-disposition", `attachment; filename='${recording.quote}.mp3'`);
        const stream = FS.createReadStream(`${this.config.recordingsDir}/${recording.id}`)
            .on("error", (err) => {
                if (err.code === "ENOENT") { return res.status(404).send(); }
                error(`Error occured when trying to read record with id ${recording.id}`);
            })
            .on("readable", async () => {
                try { stream.pipe(res); }
                catch (err) {
                    error(`Error occured when trying to stream file to browser for recording ${id}`, err);
                }
            });
    }

    @bind public async downloadVisualizedRecording({ params }: Request, res: Response) {
        const { id } = params;
        const recording = await this.db.getRepository(Recording).findOneById(id);
        if (!recording) { return res.status(404).send(); }

        const fileName = `${this.config.visualizationsDir}/${recording.id}.png`;
        const trySend = async (retries = 0) => {
            if (!await exists(fileName)) {
                if (retries === 5) { return res.status(404).send(); }
                setTimeout(() => trySend(retries + 1), 500);
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
        };

        await trySend();
    }
}
