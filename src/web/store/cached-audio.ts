import { observable, action, computed } from "mobx";
import { bind } from "decko";
import { component, inject } from "tsdi";
import { CachedAudio } from "../../common";
import { UsersStore } from "./users";

@component
export class CachedAudioStore {
    @inject private usersStore: UsersStore;

    @observable private cachedAudios: Map<string, CachedAudio> = new Map();

    @computed public get all() {
        return Array.from(this.cachedAudios.values());
    }

    @computed public get newest() {
        return this.all.reduce((newest, cachedAudio) => {
            if (!newest || cachedAudio.date < newest.date) {
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

    @bind @action public add(cachedAudio: CachedAudio) {
        cachedAudio.user = this.usersStore.byId(cachedAudio.user.id);
        this.cachedAudios.set(cachedAudio.id, cachedAudio);
    }

    @bind @action public remove(cachedAudio: CachedAudio) {
        this.cachedAudios.delete(cachedAudio.id);
    }
}
