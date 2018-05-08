import { observable, computed, action } from "mobx";
import { bind } from "decko";
import { component, inject } from "tsdi";
import { CachedAudio, Sounds, Sound, Tag, Queue, QueueItem } from "../../common";
import { TagsStore } from "./tags";
import { CachedAudioStore } from "./cached-audio";
import { SoundsQuery } from "../../common/controllers/sounds";

@component
export class SoundsStore {
    @inject private soundsController: Sounds;
    @inject private queue: Queue;
    @inject private tags: TagsStore;
    @inject private cachedAudio: CachedAudioStore;

    @observable public sounds = new Map<string, Sound>();

    @computed public get all() {
        return Array.from(this.sounds.values());
    }

    @bind @action public async untag(sound: Sound, tag: Tag) {
        const updatedSound = await this.soundsController.untagSound(sound.id, tag.id);
        Object.assign(this.sounds.get(sound.id), updatedSound);
    }

    @bind @action public async tag(sound: Sound, tagIdOrName: string) {
        if (!this.tags.byId(tagIdOrName)) {
            const tag = await this.tags.createTag(tagIdOrName);
            this.sounds.set(sound.id, await this.soundsController.tagSound(sound.id, { id: tag.id }));
            return;
        }
        const updatedSound = await this.soundsController.tagSound(sound.id, { id: tagIdOrName });
        Object.assign(this.sounds.get(sound.id), updatedSound);
    }

    @bind @action public async update(id: string, sound: Sound) {
        Object.assign(this.sounds.get(id), await this.soundsController.updateSound(id, sound));
    }

    @bind @action public async play(sound: Sound) {
        await this.queue.enqueue({
            type: "sound",
            sound: { id: sound.id },
        } as QueueItem);
        sound.used++;
    }

    @bind @action public async query(query: SoundsQuery) {
        const result = await this.soundsController.querySounds(query);
        result.sounds.forEach(sound => {
            this.sounds.set(sound.id, sound);
        });
        return result;
    }

    @bind public async byId(id: string) {
        if (this.sounds.has(id)) {
            return this.sounds.get(id);
        }
        const sound = await this.soundsController.getSound(id);
        this.sounds.set(id, sound);
        return sound;
    }

    @bind public async save({ id }: CachedAudio, description?: string) {
        const sound = await this.soundsController.save({ id });
        if (description) {
            await this.soundsController.updateSound(sound.id, { description });
        }
        this.sounds.set(sound.id, sound);
        this.cachedAudio.remove({ id });
        return sound;
    }
}
