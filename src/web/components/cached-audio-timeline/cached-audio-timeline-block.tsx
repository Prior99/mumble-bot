import * as React from "react";
import * as classNames from "classnames";
import * as Color from "color";
import { external, inject } from "tsdi";
import { Popup, Form, Image, Icon } from "semantic-ui-react";
import { observer } from "mobx-react";
import { computed, observable, action } from "mobx";
import { bind } from "decko";
import { CachedAudio } from "../../../common";
import { CachedAudioStore, SoundsStore } from "../../store";
import * as css from "./cached-audio-timeline-block.scss";

declare const baseUrl: string;

const amplitudeThreshold = 40.6;

@external @observer
export class CachedAudioTimelineBlock extends React.Component<{ cachedAudio: CachedAudio }> {
    @inject private cachedAudio: CachedAudioStore;
    @inject private sounds: SoundsStore;

    @observable private description = "";
    @observable private isOpen = false;
    @observable private loading = false;
    @observable private paused = true;

    private audio: HTMLAudioElement;

    public componentDidMount() {
        this.audio = new Audio(this.audioUrl);
        this.audio.addEventListener("pause", () => this.paused = true);
        this.audio.addEventListener("ended", () => this.paused = true);
        this.audio.addEventListener("play", () => this.paused = false);
    }

    public componentWillUnmount() {
        this.audio.pause();
        delete this.audio;
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
        this.audio.play();
    }

    @bind @action private handleClose() {
        this.isOpen = false;
        this.audio.pause();
    }

    @bind @action private handlePlay(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        if (this.audio.paused) {
            this.audio.currentTime = 0;
            this.audio.play();
            return;
        }
        this.audio.pause();
    }

    @bind @action private async handleDelete(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        this.loading = true;
        await this.cachedAudio.delete(this.props.cachedAudio);
        this.loading = false;
    }

    private get visualizationUrl() { return `${baseUrl}/cached/${this.props.cachedAudio.id}/visualized`; }
    private get audioUrl() { return `${baseUrl}/cached/${this.props.cachedAudio.id}/download`; }

    public render() {
        const { amplitude, date, duration } = this.props.cachedAudio;
        const { amplitudeTotalRange, amplitudeTotalMin } = this.cachedAudio;
        const classes = classNames(
            css.block,
            "inverted",
            "violet", {
                [css.open]: this.isOpen,
            },
        );
        const left = `${100 * this.left}%`;
        const width = `${100 * this.width}%`;
        const normalizedAmplitude = (amplitude - amplitudeTotalMin) / amplitudeTotalRange;
        const saturation = amplitude < amplitudeThreshold ? 0 : normalizedAmplitude;
        const backgroundColor = Color.hsl(250, 100 * saturation, 77).string();
        return (
            <Popup
                on="click"
                trigger={
                    <div className={classes} style={{ backgroundColor, left, width }} />
                }
                onOpen={this.handleOpen}
                onClose={this.handleClose}
                hideOnScroll
                wide="very"
                position="top center"
                className={css.popup}
            >
                <Image className={css.image} height={40} src={this.visualizationUrl} />
                <Popup.Content>
                    <Form unstackable onSubmit={this.handleSave} loading={this.loading}>
                        <Form.Group unstackable>
                            <Form.Input
                                label="Description"
                                placeholder={`Recording from ${date.toISOString()}`}
                                value={this.description}
                                onChange={this.handleDescriptionChange}
                                autoFocus
                            />
                            <Form.Button
                                onClick={this.handleDelete}
                                label="Delete"
                                icon="trash"
                                color="red"
                            />
                            <Form.Button
                                onClick={this.handlePlay}
                                label="Play"
                                icon={this.paused ? "play" : "stop"}
                                color="blue"
                            />
                            <Form.Button
                                role="submit"
                                label="Save"
                                icon="checkmark"
                                color="green"
                            />
                        </Form.Group>
                    </Form>
                    <div className={css.info}>
                        <div><Icon name="time" /> {duration}s</div>
                        <div><Icon name="calendar" /> {date.toLocaleString()}</div>
                        <div><Icon name="volume up" /> {amplitude.toFixed(2)}db</div>
                    </div>
                </Popup.Content>
            </Popup>
        );
    }
}
