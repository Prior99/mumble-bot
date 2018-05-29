import * as React from "react";
import { observer } from "mobx-react";
import { action, observable } from "mobx";
import { bind } from "decko";
import { external, inject } from "tsdi";
import { Button, Input, Icon, Modal, Header } from "semantic-ui-react";
import { Sound } from "../../../common";
import { SoundsStore } from "../../store";
import * as css from "./sound-card.scss";

export interface DescriptionProps {
    sound: Sound;
}

@external @observer
export class Description extends React.Component<DescriptionProps> {
    @inject private sounds: SoundsStore;

    @observable private description = this.props.sound.description;
    @observable private editDescription = false;
    @observable private descriptionLoading = false;
    @observable private deleteRequested = false;
    @observable private deleteLoading = false;

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
            await this.sounds.update(this.props.sound.id, { description } as Sound);
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

    @bind @action private handleDelete() {
        this.deleteRequested = true;
    }

    @bind @action private abortDelete() {
        this.deleteRequested = false;
    }

    @bind @action private async confirmDelete() {
        this.deleteLoading = true;
        await this.sounds.delete(this.props.sound.id);
        this.deleteLoading = false;
        this.deleteRequested = false;
    }

    public render() {
        const { sound } = this.props;
        const { description } = sound;
        return (
            <>
                {
                    this.deleteRequested && (
                        <Modal open>
                            <Header icon="trash" content="Delete Sound" />
                            <Modal.Content>
                                <p>Are you sure you want to delete this sound?</p>
                                <p><i>{description}</i></p>
                            </Modal.Content>
                            <Modal.Actions>
                                <Button
                                    color="red"
                                    icon="remove"
                                    content="No"
                                    onClick={this.abortDelete}
                                    loading={this.deleteLoading}
                                />
                                <Button
                                    color="green"
                                    icon="checkmark"
                                    content="Yes"
                                    onClick={this.confirmDelete}
                                    loading={this.deleteLoading}
                                />
                            </Modal.Actions>
                        </Modal>
                    )
                }
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
                    </> : <div className={css.descriptionContainer}>
                        {`${description} `}
                        <Icon name="pencil" color="grey" link onClick={this.handleStartEditDescription} />
                        <Icon name="trash" color="grey" link onClick={this.handleDelete} />
                    </div>
                }
            </>
        );
    }
}
