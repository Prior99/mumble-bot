import { observable, computed, action } from "mobx";
import { bind } from "decko";
import { component, inject } from "tsdi";
import { SoundsQuery, CachedAudio, Sounds, Sound, Tag, Queue, QueueItem } from "../../common";
import { TagsStore } from "./tags";
import { CachedAudioStore } from "./cached-audio";

@component
export class SoundsStore {
    @inject private soundsController: Sounds;
    @inject private queue: Queue;
    @inject private tags: TagsStore;
    @inject private cachedAudio: CachedAudioStore;

    @observable public sounds = new Map<string, Sound>();
    @observable public pitch = 0;
    @observable public echo = 0;

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

    @bind @action public async delete(id: string) {
        this.sounds.set(id, await this.soundsController.deleteSound(id));
    }

    @bind @action public async play(sound: Sound) {
        await this.queue.enqueue({
            type: "sound",
            sound: { id: sound.id },
            pitch: this.pitch,
            echo: this.echo,
        } as QueueItem);
        sound.used++;
        this.sounds.set(sound.id, sound);
    }

    @bind @action public async query(query: SoundsQuery) {
        const result = await this.soundsController.querySounds(query);
        result.sounds.forEach(sound => this.sounds.set(sound.id, sound));
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

    @bind @action public async save({ id }: CachedAudio, description?: string) {
        const sound = await this.soundsController.save({ id });
        if (description) {
            await this.soundsController.updateSound(sound.id, { description } as Sound);
        }
        this.sounds.set(sound.id, sound);
        this.cachedAudio.remove({ id });
        return sound;
    }

    @bind public async fork({ id }: Sound, overwrite: boolean, description: string, start: number, end: number) {
        const forkedSound = await this.soundsController.forkSound(id, {
            description,
            overwrite,
            actions: [
                { action: "crop", start, end },
            ],
        });
        this.sounds.set(forkedSound.id, forkedSound);
        const original = this.sounds.get(id);
        this.sounds.set(id, await this.soundsController.getSound(original.id));
        return forkedSound;
    }

    @bind public async rate(id: string, stars: number) {
        const ratedSound = await this.soundsController.rateSound(id, { stars });
        this.sounds.set(id, ratedSound);
        return ratedSound;
    }
}
