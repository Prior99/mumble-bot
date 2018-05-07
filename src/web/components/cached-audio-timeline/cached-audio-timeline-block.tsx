import * as React from "react";
import * as classNames from "classnames";
import { external, inject } from "tsdi";
import { Popup, Form, Button } from "semantic-ui-react";
import { observer } from "mobx-react";
import { computed, observable, action } from "mobx";
import { bind } from "decko";
import { CachedAudio } from "../../../common";
import { CachedAudioStore } from "../../store";
import * as css from "./cached-audio-timeline-block.scss";

@external @observer
export class CachedAudioTimelineBlock extends React.Component<{ cachedAudio: CachedAudio }> {
    @inject private cachedAudio: CachedAudioStore;

    @observable private description = "";
    @observable private isOpen = false;

    @computed private get start() {
        return this.props.cachedAudio.date.getTime();
    }

    @computed private get left() {
        const { cachedAudio, props } = this;
        const { selectionStart, selectedRange } = cachedAudio;
        return (props.cachedAudio.date.getTime() - selectionStart.getTime()) / selectedRange;
    }

    @computed private get width() {
        return this.props.cachedAudio.duration * 1000 / this.cachedAudio.selectedRange;
    }

    @bind @action private handleDescriptionChange({ currentTarget }: React.SyntheticInputEvent) {
        this.description = currentTarget.value;
    }

    @bind @action private handleSave() {
    }

    @bind @action private handleOpen() {
        this.isOpen = true;
    }

    @bind @action private handleClose() {
        this.isOpen = false;
    }

    public render() {
        const classes = classNames(
            css.block,
            "inverted",
            "violet", {
                [css.open]: this.isOpen
            }
        );
        const left = `${100 * this.left}%`;
        const width = `${100 * this.width}%`;
        return (
            <Popup
                on="click"
                trigger={
                    <div className={classes} style={{ left, width }} />
                }
                onOpen={this.handleOpen}
                onClose={this.handleClose}
                hideOnScroll
                wide="very"
                horizontalOffset={5}
            >
                <Popup.Content>
                    <Form onSubmit={this.handleSave}>
                        <Form.Group>
                            <Button.Group>
                                <Button icon="pause" color="grey" />
                                <Button icon="play" color="blue" />
                            </Button.Group>
                            <Form.Input
                                placeholder={`Recording from ${this.props.cachedAudio.date.toISOString()}`}
                                value={this.description}
                                onChange={this.handleDescriptionChange}
                            />
                            <Form.Button icon="checkmark" color="green" />
                        </Form.Group>
                    </Form>
                </Popup.Content>
            </Popup>
        );
    }
}
