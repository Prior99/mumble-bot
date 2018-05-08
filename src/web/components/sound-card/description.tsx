import * as React from "react";
import { observer } from "mobx-react";
import { action, observable } from "mobx";
import { bind } from "decko";
import { external, inject } from "tsdi";
import { Button, Input, Icon } from "semantic-ui-react";
import { Sound } from "../../../common";
import { SoundsStore } from "../../store";

export interface DescriptionProps {
    sound: Sound;
}

@external @observer
export class Description extends React.Component<DescriptionProps> {
    @inject private sounds: SoundsStore;

    @observable private description = this.props.sound.description;
    @observable private editDescription = false;
    @observable private descriptionLoading = false;

    @bind @action private handleStartEditDescription() { this.editDescription = true; }

    @bind @action private async handleAbortEditDescription() {
        const { sound } = this.props;
        this.description = sound.description;
        this.editDescription = false;
    }

    @bind @action private async handleFinishEditDescription() {
        const { description } = this;
        if (description !== this.props.sound.description) {
            this.descriptionLoading = true;
            await this.sounds.update(this.props.sound.id, { description });
            this.descriptionLoading = false;
        }
        this.editDescription = false;
    }

    @bind @action private handleDescriptionChange(event: React.SyntheticInputEvent) {
        this.description = event.target.value;
    }

    @bind @action private handleDescriptionKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") {
            this.handleFinishEditDescription();
        }
        if (event.key === "Escape") {
            this.handleAbortEditDescription();
        }
        if (event.key === "Tab") {
            this.handleAbortEditDescription();
        }
    }

    public render() {
        const { sound } = this.props;
        const { description } = sound;
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
