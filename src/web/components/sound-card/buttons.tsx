import * as React from "react";
import { observer } from "mobx-react";
import { action, observable } from "mobx";
import { bind } from "decko";
import { external, inject } from "tsdi";
import { Button  } from "semantic-ui-react";
import { Sound } from "../../../common";
import { SoundsStore } from "../../store";

export interface ButtonsProps {
    sound: Sound;
}

@observer @external
export class Buttons extends React.Component<ButtonsProps> {
    @inject private sounds: SoundsStore;

    @observable private loading = false;

    @bind @action private async handlePlayClick() {
        this.loading = true;
        await this.sounds.play(this.props.sound);
        this.loading = false;
    }

    public render() {
        const { used } = this.props.sound;
        return (
            <>
                <Button
                    content="Play"
                    icon="volume up"
                    label={{ as: "a", basic: true, pointing: "right", content: used }}
                    labelPosition="left"
                    onClick={this.handlePlayClick}
                    loading={this.loading}
                    disabled={this.loading}
                />
            </>
        );
    }
}
