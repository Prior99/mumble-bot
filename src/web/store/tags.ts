import { observable, computed, action } from "mobx";
import { bind } from "decko";
import { component, initialize, inject } from "tsdi";
import { Tags, Tag } from "../../common";

@component
export class TagsStore {
    @inject private tagsController: Tags;

    @observable private tags = new Map<string, Tag>();

    @initialize
    protected async initialize() {
        const tags = await this.tagsController.listTags();
        tags.forEach(tag => this.tags.set(tag.id, tag));
    }

    @computed public get all() {
        return Array.from(this.tags.values());
    }

    @bind public byId(id: string) {
        return this.tags.get(id);
    }

    @bind @action public async createTag(name: string) {
        const newTag = await this.tagsController.createTag({ name });
        this.tags.set(newTag.id, newTag);
        return newTag;
    }
}
