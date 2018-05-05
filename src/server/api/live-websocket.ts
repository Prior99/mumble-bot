import * as WebSocket from "ws";
import { bind } from "decko";
import { error, info } from "winston";
import { dump, uuid } from "hyrest";
import { Connection } from "typeorm";
import { external, inject, initialize } from "tsdi";
import { CachedAudio, LiveEvent, live, QueueItem, Token } from "../../common";
import { AudioOutput } from "../audio-output";
import { AudioCache } from "../audio-cache";

interface Authorization {
    token: Token;
}

function isAuthorization(arg: any): arg is Authorization {
    if (typeof arg !== "object") { return false; }
    if (typeof arg.token !== "object") { return false; }
    if (typeof arg.token.id !== "string") { return false; }
    if (uuid(arg.token.id).error) { return false; }
    return true;
}

@external
export class LiveWebsocket {
    @inject private audioOutput: AudioOutput;
    @inject private audioCache: AudioCache;
    @inject private db: Connection;

    private ws: WebSocket;
    private authorized = false;

    constructor(ws: WebSocket) {
        this.ws = ws;
    }

    @initialize
    protected initialize() {
        this.audioOutput.on("clear", this.handleQueueClear);
        this.audioOutput.on("push", this.handleQueuePush);
        this.audioOutput.on("shift", this.handleQueueShift);
        this.audioCache.on("add", this.handleCacheAdd);
        this.audioCache.on("remove", this.handleCacheRemove);
        this.ws.on("close", this.stop);
        this.ws.on("message", this.handleWsMessage);
    }

    @bind private async handleWsMessage(data: string) {
        try {
            const authorization = JSON.parse(data);
            if (!isAuthorization(authorization)) {
                this.terminate();
                info(`Received malformed authorization from websocket.`);
                return;
            }
            const token = await this.db.getRepository(Token).findOne(authorization.token.id);
            if (!token) {
                this.terminate();
                info(`Received unknown token from websocket.`);
                return;
            }
            this.authorized = true;
            this.send(new LiveEvent("init", this.audioOutput.queue, this.audioCache.all));
        } catch (err) {
            info(`Received malformed message from websocket.`);
        }
    }

    @bind private handleQueueShift(queueItem: QueueItem) {
        this.send(new LiveEvent("queue shift", queueItem));
    }

    @bind private handleQueuePush(queueItem: QueueItem) {
        this.send(new LiveEvent("queue push", queueItem));
    }

    @bind private handleCacheAdd(cachedAudio: CachedAudio) {
        this.send(new LiveEvent("cache add", cachedAudio));
    }

    @bind private handleCacheRemove(cachedAudio: CachedAudio) {
        this.send(new LiveEvent("cache remove", cachedAudio));
    }

    @bind private handleQueueClear() {
        this.send(new LiveEvent("queue clear"));
    }

    @bind private stop() {
        this.audioOutput.removeListener("clear", this.handleQueueClear);
        this.audioOutput.removeListener("shift", this.handleQueueShift);
        this.audioOutput.removeListener("push", this.handleQueuePush);
        this.audioCache.removeListener("add", this.handleCacheAdd);
        this.audioCache.removeListener("remove", this.handleCacheRemove);
    }

    private terminate() {
        this.ws.close();
        this.stop();
    }

    private send(event: LiveEvent) {
        if (!this.authorized) { return; }
        try {
            this.ws.send(JSON.stringify(dump(live, event)));
        } catch (err) {
            error("Error sending packet to live queue websocket:", err);
        }
    }
}

export function createLiveWebsocket(ws: WebSocket) {
    return new LiveWebsocket(ws);
}
