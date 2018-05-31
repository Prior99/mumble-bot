import * as React from "react";
import { observer } from "mobx-react";
import { action, observable } from "mobx";
import { bind } from "decko";
import { external, inject } from "tsdi";
import { Button, Input, Icon } from "semantic-ui-react";
import { Playlist } from "../../../common";
import { PlaylistsStore } from "../../store";

export interface DescriptionProps {
    playlist: Playlist;
}

@external @observer
export class Description extends React.Component<DescriptionProps> {
    @inject private playlists: PlaylistsStore;

    @observable private description = this.props.playlist.description;
    @observable private editDescription = false;
    @observable private descriptionLoading = false;

    @bind @action private handleStartEditDescription() { this.editDescription = true; }

    @bind @action private async handleAbortEditDescription() {
        const { playlist } = this.props;
        this.description = playlist.description;
        this.editDescription = false;
    }

    @bind @action private async handleFinishEditDescription() {
        const { description } = this;
        if (description !== this.props.playlist.description) {
            this.descriptionLoading = true;
            await this.playlists.update(this.props.playlist.id, { description } as Playlist);
            this.descriptionLoading = false;
        }
        this.editDescription = false;
    }

    @bind @action private handleDescriptionChange(event: React.SyntheticInputEvent) {
        this.description = event.target.value;
    }

    @bind @action private handleDescriptionKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        switch (event.key) {
            case "Enter":
                this.handleFinishEditDescription(); break;
            case "Esc":
            case "Escape":
                this.handleAbortEditDescription(); break;
            case "Tab":
                this.handleAbortEditDescription(); break;
            default: break;
        }
    }

    public render() {
        const { playlist } = this.props;
        const { description } = playlist;
        return (
            <>
                {
                    this.editDescription ? <>
                        <Input
                            label={
                                <Button
                                    icon="checkmark"
                                    onClick={this.handleFinishEditDescription}
                                    loading={this.descriptionLoading}
                                    disabled={this.descriptionLoading}
                                    color="green"
                                />
                            }
                            ref={element => element && element.focus()}
                            disabled={this.descriptionLoading}
                            labelPosition="right"
                            fluid
                            value={this.description}
                            onChange={this.handleDescriptionChange}
                            onKeyDown={this.handleDescriptionKeyDown}
                        />
                    </> : <>
                        {`${description} `}
                        <Icon name="pencil" color="grey" link onClick={this.handleStartEditDescription} />
                    </>
                }
            </>
        );
    }
}
