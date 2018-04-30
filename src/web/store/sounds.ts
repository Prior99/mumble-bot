import { observable, computed } from "mobx";
import { bind } from "decko";
import { component, initialize, inject } from "tsdi";
import { Sounds, Sound } from "../../common";

@component
export class SoundsStore {
    @inject private soundsController: Sounds;

    @observable public sounds = new Map<string, Sound>();
    @observable public loading = false;

    @initialize
    protected async initialize() {
        this.loading = true;
        const sounds = await this.soundsController.querySounds();
        sounds.forEach(sound => this.sounds.set(sound.id, sound));
        this.loading = false;
    }

    @computed public get all() {
        return Array.from(this.sounds.values());
    }
}
