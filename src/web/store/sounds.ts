import { observable, computed, action } from "mobx";
import { bind } from "decko";
import { component, initialize, inject } from "tsdi";
import { Sounds, Sound, Tag } from "../../common";
import { TagsStore } from "./tags";

@component
export class SoundsStore {
    @inject private soundsController: Sounds;
    @inject private tags: TagsStore;

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

    @bind @action public async untag(sound: Sound, tag: Tag) {
        this.sounds.set(sound.id, await this.soundsController.untagSound(sound.id, tag.id));
    }

    @bind @action public async tag(sound: Sound, tagIdOrName: string) {
        if (!this.tags.byId(tagIdOrName)) {
            const tag = await this.tags.createTag(tagIdOrName);
            this.sounds.set(sound.id, await this.soundsController.tagSound(sound.id, { id: tag.id }));
            return;
        }
        this.sounds.set(sound.id, await this.soundsController.tagSound(sound.id, { id: tagIdOrName }));
    }

    @bind @action public async update(id: string, sound: Sound) {
        this.sounds.set(id, await this.soundsController.updateSound(id, sound));
    }
}
