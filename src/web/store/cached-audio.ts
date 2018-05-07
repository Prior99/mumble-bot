import { observable, action, computed } from "mobx";
import { bind } from "decko";
import { subDays } from "date-fns";
import { component, inject } from "tsdi";
import { CachedAudio } from "../../common";
import { UsersStore } from "./users";

@component
export class CachedAudioStore {
    @inject private usersStore: UsersStore;

    @observable private cachedAudios: Map<string, CachedAudio> = new Map();

    @observable public selectionStart: Date = subDays(new Date(), 1);
    @observable public selectionEnd: Date = new Date();

    @computed public get all() {
        return Array.from(this.cachedAudios.values());
    }

    @computed public get newest() {
        return this.all.reduce((newest, cachedAudio) => {
            if (!newest || cachedAudio.date > newest.date) {
                return cachedAudio;
            }
            return newest;
        }, undefined);
    }

    @computed public get oldest() {
        return this.all.reduce((oldest, cachedAudio) => {
            if (!oldest || cachedAudio.date < oldest.date) {
                return cachedAudio;
            }
            return oldest;
        }, undefined);
    }

    @computed public get oldestTime() {
        const { oldest } = this;
        if (!oldest) { return subDays(new Date(), 1).getTime(); }
        return this.oldest.date.getTime();
    }

    @computed public get newestTime() {
        const { newest } = this;
        if (!newest) { return Date.now(); }
        return this.newest.date.getTime() + newest.duration * 1000;
    }

    @computed public get totalRange() {
        const { newestTime, oldestTime } = this;
        return newestTime - oldestTime;
    }

    @computed public get selectedRange() {
        const { selectionStart, selectionEnd } = this;
        return selectionEnd.getTime() - selectionStart.getTime();
    }

    @bind @action public add(cachedAudio: CachedAudio) {
        cachedAudio.user = this.usersStore.byId(cachedAudio.user.id);
        this.cachedAudios.set(cachedAudio.id, cachedAudio);
    }

    @bind @action public remove(cachedAudio: CachedAudio) {
        this.cachedAudios.delete(cachedAudio.id);
    }
}
