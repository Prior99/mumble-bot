import { SoundsStore } from "./";
import { EventEmitter } from "events";
import { observable, action } from "mobx";
import { populate } from "hyrest";
import { bind } from "decko";
import { component, inject, initialize } from "tsdi";
import { live, LiveEvent, QueueItem, CachedAudio } from "../../common";
import { LoginStore } from "./login";
import { UsersStore } from "./";

declare const baseUrl: string;

@component("LiveWebsocket")
export class LiveWebsocket extends EventEmitter {
    @inject private loginStore: LoginStore;
    @inject private usersStore: UsersStore;
    @inject private soundsStore: SoundsStore;

    @observable private loading = true;
    @observable private initialized = false;
    @observable public queue: QueueItem[] = [];
    @observable private cachedAudios: Map<string, CachedAudio> = new Map();

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

    @bind private addCachedAudio(cachedAudio: CachedAudio) {
        cachedAudio.user = this.usersStore.byId(cachedAudio.user.id);
        this.cachedAudios.set(cachedAudio.id, cachedAudio);
    }

    @bind private async addQueueItem(queueItem: QueueItem) {
        queueItem.user = this.usersStore.byId(queueItem.user.id);
        if (queueItem.sound) {
            queueItem.sound = await this.soundsStore.byId(queueItem.sound.id);
        }
        if (queueItem.cachedAudio) {
            queueItem.cachedAudio.user = this.usersStore.byId(queueItem.cachedAudio.user.id);
        }
        this.queue.push(queueItem);
    }

    @bind private handleOpen() {
        this.ws.send(JSON.stringify({
            token: { id: this.loginStore.authToken },
        }));
    }

    @bind @action private async handleInit({ queue, cachedAudios }: LiveEvent) {
        // Needs to be done in order and hence `Promise.all` can't be used.
        for (let queueItem of queue) {
            await this.addQueueItem(queueItem);
        }
        await Promise.all(cachedAudios.map(this.addCachedAudio));
        this.loading = false;
    }

    @bind @action private async handleCacheAdd({ cachedAudio }: LiveEvent) {
        this.addCachedAudio(cachedAudio);
    }

    @bind @action private handleCacheRemove({ cachedAudio }: LiveEvent) {
        this.cachedAudios.delete(cachedAudio.id);
    }

    @bind @action private handleQueueShift() {
        this.queue.shift();
    }

    @bind @action private handleQueuePush({ queueItem }: LiveEvent) {
        this.addQueueItem(queueItem);
    }

    @bind @action private handleQueueClear() {
        this.queue = [];
    }

    @bind private handleMessage({ data }: MessageEvent) {
        console.log(data, "LOLOL")
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
