import * as React from "react";
import { observer } from "mobx-react";
import { action, observable } from "mobx";
import { bind } from "decko";
import { external, inject } from "tsdi";
import { Button  } from "semantic-ui-react";
import { Sound } from "../../../common";
import { SoundsStore } from "../../store";
import * as css from "./sound-card.scss";

export interface ButtonsProps {
    sound: Sound;
}

declare const baseUrl: string;

@observer @external
export class Buttons extends React.Component<ButtonsProps> {
    @inject private sounds: SoundsStore;

    @observable private loading = false;
    @observable private paused = true;

    private audio: HTMLAudioElement;

    private get audioUrl() { return `${baseUrl}/sound/${this.props.sound.id}/download`; }

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

    @bind @action private async handlePlayClick() {
        this.loading = true;
        await this.sounds.play(this.props.sound);
        this.loading = false;
    }

    @bind @action private async handlePreviewClick() {
        if (this.audio.paused) {
            this.audio.currentTime = 0;
            this.audio.play();
            return;
        }
        this.audio.pause();
    }

    public render() {
        const { used } = this.props.sound;
        return (
            <div className={css.buttonContainer}>
                <Button
                    className={css.button}
                    icon="volume up"
                    label={{ as: "a", basic: true, pointing: "right", content: used }}
                    labelPosition="left"
                    onClick={this.handlePlayClick}
                    loading={this.loading}
                    disabled={this.loading}
                    color="green"
                />
                <Button
                    className={css.button}
                    icon={this.paused ? "headphone" : "stop"}
                    onClick={this.handlePreviewClick}
                    color="blue"
                />
            </div>
        );
    }
}
