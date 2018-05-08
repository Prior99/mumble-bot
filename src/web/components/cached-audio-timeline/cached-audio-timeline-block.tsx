import * as React from "react";
import * as classNames from "classnames";
import { external, inject } from "tsdi";
import { Popup, Form, Image, Input } from "semantic-ui-react";
import { observer } from "mobx-react";
import { computed, observable, action } from "mobx";
import { bind } from "decko";
import { CachedAudio } from "../../../common";
import { CachedAudioStore, SoundsStore } from "../../store";
import * as css from "./cached-audio-timeline-block.scss";

declare const baseUrl: string;

@external @observer
export class CachedAudioTimelineBlock extends React.Component<{ cachedAudio: CachedAudio }> {
    @inject private cachedAudio: CachedAudioStore;
    @inject private sounds: SoundsStore;

    @observable private description = "";
    @observable private isOpen = false;
    @observable private loading = false;

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

    @bind @action private async handleSave() {
        this.loading = true;
        await this.sounds.save(this.props.cachedAudio, this.description);
        this.loading = false;
    }

    @bind @action private handleOpen() {
        this.isOpen = true;
    }

    @bind @action private handleClose() {
        this.isOpen = false;
    }

    private get visualizationUrl() { return `${baseUrl}/cached/${this.props.cachedAudio.id}/visualized`; }

    @bind private refForm(form: HTMLFormElement) {
        console.log(form)
        return;
        // if (!form) { return; }
        // const input: HTMLInputElement = form.querySelector(`input[type="input"]`);
        // if (input) { input.focus(); }
    }

    public render() {
        const classes = classNames(
            css.block,
            "inverted",
            "violet", {
                [css.open]: this.isOpen,
            },
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
                className={css.popup}
            >
                <Image className={css.image} height={40} src={this.visualizationUrl} />
                <Popup.Content>
                    <Form unstackable ref={this.refForm} onSubmit={this.handleSave} loading={this.loading}>
                        <Form.Group unstackable>
                            <Form.Input
                                label="Description"
                                placeholder={`Recording from ${this.props.cachedAudio.date.toISOString()}`}
                                value={this.description}
                                onChange={this.handleDescriptionChange}
                                autoFocus
                            />
                            <Form.Button label="Pause" icon="pause" color="grey" />
                            <Form.Button label="Play" icon="play" color="blue" />
                            <Form.Button label="Save" icon="checkmark" color="green" />
                        </Form.Group>
                    </Form>
                </Popup.Content>
            </Popup>
        );
    }
}
