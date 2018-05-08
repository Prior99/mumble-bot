import { observable, action, computed } from "mobx";
import { bind } from "decko";
import { subDays, addSeconds, areRangesOverlapping } from "date-fns";
import { component, inject } from "tsdi";
import { CachedAudio, User } from "../../common";
import { UsersStore } from "./users";

@component
export class CachedAudioStore {
    @inject private usersStore: UsersStore;

    @observable private cachedAudios: Map<string, CachedAudio> = new Map();

    @observable public selectionStart: Date;
    @observable public selectionEnd: Date;

    @computed public get totalDuration() {
        return this.all.reduce((sum, cachedAudio) => sum + cachedAudio.duration, 0);
    }

    @computed public get selectionFollowing() {
        if (!this.selectionDefined) { return false; }
        if (this.selectionEnd.getTime() - this.newestTime > -5000) {
            return true;
        }
    }

    @computed public get selectionDefined() {
        return Boolean(this.selectionStart && this.selectionEnd);
    }

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

    public byUser(user: User) {
        return this.all.filter(cachedAudio => cachedAudio.user.id === user.id);
    }

    @bind public isInSelection({ date: start, duration }: CachedAudio) {
        const { selectionStart, selectionEnd } = this;
        if (!selectionStart || !selectionEnd) { return false; }
        const end = addSeconds(start, duration);
        if (selectionStart > selectionEnd) {
            return areRangesOverlapping(start, end, selectionEnd, selectionStart);
        }
        return areRangesOverlapping(start, end, selectionStart, selectionEnd);
    }

    @computed public get inSelection() {
        return this.all.filter(this.isInSelection);
    }

    public inSelectionByUser(user: User) {
        return this.inSelection.filter(cachedAudio => cachedAudio.user.id === user.id);
    }

    @bind @action public add(cachedAudio: CachedAudio) {
        cachedAudio.user = this.usersStore.byId(cachedAudio.user.id);
        this.cachedAudios.set(cachedAudio.id, cachedAudio);
        if (this.selectionFollowing) {
            const distance = addSeconds(cachedAudio.date, cachedAudio.duration).getTime() - this.newestTime;
            this.selectionEnd = addSeconds(this.selectionEnd, distance / 1000);
            this.selectionStart = addSeconds(this.selectionStart, distance / 1000);
        }
    }

    @bind @action public remove(cachedAudio: CachedAudio) {
        this.cachedAudios.delete(cachedAudio.id);
    }
}