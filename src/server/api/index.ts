import * as Express from "express";
import { Socket } from "net";
import { Request, Response } from "express";
import * as expressWS from "express-ws";
import * as BodyParser from "body-parser";
import { Server } from "http";
import { Connection } from "typeorm";
import { component, inject, initialize, TSDI, destroy } from "tsdi";
import { info, error } from "winston";
import { bind } from "decko";
import { createReadStream, existsSync } from "fs-extra";
import { hyrest } from "hyrest-express";
import { AuthorizationMode, configureController, ControllerMode } from "hyrest";
import * as morgan from "morgan";
import { ServerConfig } from "../../config";
import { allControllers, Sound, Token, Context, getAuthTokenId } from "../../common";
import { AudioCache } from "../audio-cache";
import { cors, catchError } from "./middlewares";
import { createLiveWebsocket } from "./live-websocket";

@component
export class RestApi {
    @inject private db: Connection;
    @inject private config: ServerConfig;
    @inject private audioCache: AudioCache;
    @inject private tsdi: TSDI;

    private connections = new Set<Socket>();
    public app: Express.Application;
    private server: Server;

    @initialize
    protected initialize() {
        configureController(
            allControllers,
            { mode: ControllerMode.SERVER },
        );
        this.app = Express();
        this.app.use(BodyParser.json({ limit: "100mb", strict: false }));
        this.app.use(BodyParser.urlencoded({ limit: "100mb", extended: true }));
        this.app.use(morgan("tiny", { stream: { write: msg => info(msg.trim()) } }));
        this.app.use(cors);
        this.app.use(catchError);
        this.app.get("/cached/:id/download", this.downloadCached);
        this.app.get("/cached/:id/visualized", this.downloadVisualizedCached);
        this.app.get("/sound/:id/download", this.downloadSound);
        this.app.get("/sound/:id/visualized", this.downloadVisualizedSound);
        expressWS(this.app).app.ws("/live", this.websocket);
        this.app.use(
            hyrest(...allControllers.map((controller: any) => this.tsdi.get(controller)))
                .context(req => new Context(req))
                .defaultAuthorizationMode(AuthorizationMode.AUTH)
                .authorization(async req => {
                    const id = getAuthTokenId(req);
                    if (!id) { return false; }
                    const token = await this.tsdi.get(Connection).getRepository(Token).findOne({
                        where: { id },
                        relations: ["user"],
                    });
                    if (!token) { return false; }
                    if (token.deleted) { return false; }
                    if (!token.user.enabled) { return false; }
                    return true;
                }),
        );
    }

    public serve() {
        const port = this.config.port;
        this.server = this.app.listen(port);
        this.server.on("connection", this.onConnection);
        info(`Api started, listening on port ${port}.`);
    }

    /**
     * Called when a new connection was opened by the webserver.
     * @param conn The socket that was opened.
     */
    @bind private onConnection(conn: Socket) {
        this.connections.add(conn);
        conn.on("close", () => this.connections.delete(conn));
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

    @bind public websocket(ws) {
        createLiveWebsocket(ws);
    }

    @bind public downloadCached({ params }: Request, res: Response) {
        const { id } = params;
        const sound = this.audioCache.byId(id);
        if (!sound) { return res.status(404).send(); }

        res.setHeader("Content-disposition", `attachment; filename='cached_${id}.mp3'`);
        const stream = createReadStream(`${this.config.tmpDir}/${sound.id}`)
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
        const sound = this.audioCache.byId(id);
        if (!sound) { return res.status(404).send(); }

        const fileName = `${this.config.tmpDir}/${sound.id}.png`;
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
                    error(`Error sending visualization of ${sound.id} to client.`, err);
                }).pipe(res);
            } catch (err) {
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
        const attachmentName = sound.description.toLowerCase().replace(/[^a-z0-9]/gi, "-");
        res.setHeader("Content-disposition", `attachment; filename='${attachmentName}.mp3'`);
        try {
            res.status(200);
            createReadStream(fileName).on("error", (err) => {
                error(`Error sending audio file ${fileName} to client.`, err);
                res.status(500).send();
            }).pipe(res);
        } catch (err) {
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
        } catch (err) {
            error("Error occured during request of sound visualization.", err);
            return res.status(500).send();
        }
    }
}
