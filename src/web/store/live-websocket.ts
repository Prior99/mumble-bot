import { EventEmitter } from "events";
import { observable } from "mobx";
import { populate } from "hyrest";
import { bind } from "decko";
import { component, inject, initialize } from "tsdi";
import { live, LiveEvent } from "../../common";
import { CachedAudioStore } from "./cached-audio";
import { QueueStore } from "./queue";
import { LoginStore } from "./login";

declare const baseUrl: string;

@component("LiveWebsocket")
export class LiveWebsocket extends EventEmitter {
    @inject("LoginStore") private loginStore: LoginStore;
    @inject private cachedAudio: CachedAudioStore;
    @inject private queue: QueueStore;

    @observable public loading = true;
    @observable public initialized = false;

    private ws: WebSocket;

    @initialize
    public initialize() {
        if (!this.loginStore.loggedIn) { return; }
        const websocketUrl = `${baseUrl.replace("http", "ws")}/live`;
        this.ws = new WebSocket(websocketUrl);
        this.ws.addEventListener("message", this.handleMessage);
        this.ws.addEventListener("open", this.handleOpen);
        this.initialized = true;
    }

    @bind private handleOpen() {
        this.ws.send(JSON.stringify({
            token: { id: this.loginStore.authToken },
        }));
    }

    @bind private async handleInit({ queue, cachedAudios }: LiveEvent) {
        // Needs to be done in order and hence `Promise.all` can't be used.
        for (let queueItem of queue) {
            await this.queue.add(queueItem);
        }
        await Promise.all(cachedAudios.map(this.cachedAudio.add));
        this.loading = false;
    }

    @bind private async handleCacheAdd({ cachedAudio }: LiveEvent) {
        this.cachedAudio.add(cachedAudio);
    }

    @bind private handleCacheRemove({ cachedAudio }: LiveEvent) {
        this.cachedAudio.remove(cachedAudio);
    }

    @bind private handleQueueShift() {
        this.queue.shift();
    }

    @bind private handleQueuePush({ queueItem }: LiveEvent) {
        this.queue.add(queueItem);
    }

    @bind private handleQueueClear() {
        this.queue.clear();
    }

    @bind private handleMessage({ data }: MessageEvent) {
        const liveEvent = populate(live, LiveEvent, JSON.parse(data));
        switch (liveEvent.event) {
            case "init": this.handleInit(liveEvent); break;
            case "cache add": this.handleCacheAdd(liveEvent); break;
            case "cache remove": this.handleCacheRemove(liveEvent); break;
            case "queue shift": this.handleQueueShift(); break;
            case "queue push": this.handleQueuePush(liveEvent); break;
            case "queue clear": this.handleQueueClear(); break;
            default: break;
        }
        this.emit("event", liveEvent);
    }
}
