import * as React from "react";
import { observer } from "mobx-react";
import { action, observable } from "mobx";
import { bind } from "decko";
import { external, inject } from "tsdi";
import { Icon, Label, Dropdown } from "semantic-ui-react";
import { Sound, Tag } from "../../../common";
import { TagLabel } from "../tag-label";
import { TagsStore, SoundsStore } from "../../store";
import * as css from "./sound-card.scss";

export interface TagsProps {
    sound: Sound;
}

@external @observer
export class Tags extends React.Component<TagsProps> {
    @inject private sounds: SoundsStore;
    @inject private tags: TagsStore;

    @observable private editTags = false;
    @observable private tagsLoading = false;

    @bind @action private handleUntag(tag: Tag) { this.sounds.untag(this.props.sound, tag); }

    @bind @action private handleStartEditTags() { this.editTags = true; }

    @bind @action private handleFinishEditTags() { this.editTags = false; }

    @bind @action private async handleAddTagChange(_: React.SyntheticInputEvent, { value }: { value: string }) {
        this.tagsLoading = true;
        await this.sounds.tag(this.props.sound, value);
        this.tagsLoading = false;
    }

    public render() {
        return (
            <>
                <Label.Group className={css.tagGroup}>
                    {
                        this.props.sound.soundTagRelations.map(({ id, tag }) => (
                            <TagLabel key={id} tag={tag} onRemove={this.editTags && (() => this.handleUntag(tag))}/>
                        ))
                    }
                    {
                        !this.editTags ? (
                            <Icon name="pencil" color="grey" link onClick={this.handleStartEditTags} />
                        ) : (
                            <Icon name="checkmark" color="grey" link onClick={this.handleFinishEditTags} />
                        )
                    }
                </Label.Group>
                {
                    this.editTags && <>
                        <Dropdown
                            placeholder="Add Tag"
                            search
                            fluid
                            selection
                            selectOnNavigation={false}
                            selectOnBlur={false}
                            options={this.tags.dropdownOptions}
                            onChange={this.handleAddTagChange}
                            loading={this.tagsLoading}
                            disabled={this.tagsLoading}
                            value={undefined}
                            closeOnChange={false}
                            allowAdditions
                        />{" "}
                    </>
                }
            </>
        );
    }
}
