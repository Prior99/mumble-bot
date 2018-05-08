import { EventEmitter } from "events";
import { observable, action, computed } from "mobx";
import { populate } from "hyrest";
import { bind } from "decko";
import { component, inject } from "tsdi";
import { QueueItem } from "../../common";
import { UsersStore } from "./users";
import { SoundsStore } from "./sounds";

declare const baseUrl: string;

@component
export class QueueStore extends EventEmitter {
    @inject private usersStore: UsersStore;
    @inject private soundsStore: SoundsStore;

    @observable public queue: QueueItem[] = [];
    @observable public currentItem: QueueItem;
    @observable public maxDurationSinceLastClear = 0;

    @computed public get totalSeconds() {
        const currentDuration = this.currentItem ? this.currentItem.duration : 0;
        return this.queue.reduce((result, queueItem) => result + queueItem.duration, currentDuration);
    }

    @bind @action public async add(queueItem: QueueItem) {
        queueItem.user = this.usersStore.byId(queueItem.user.id);
        if (queueItem.sound) {
            queueItem.sound = await this.soundsStore.byId(queueItem.sound.id);
        }
        if (queueItem.cachedAudio) {
            queueItem.cachedAudio.user = this.usersStore.byId(queueItem.cachedAudio.user.id);
        }
        this.queue.push(queueItem);
        this.maxDurationSinceLastClear = Math.max(this.maxDurationSinceLastClear, this.totalSeconds);
    }

    @bind @action public shift() {
        this.currentItem = this.queue.shift();
        if (this.queue.length === 0) {
            this.maxDurationSinceLastClear = 0;
        }
    }

    @bind @action public clear() {
        this.queue = [];
    }
}
