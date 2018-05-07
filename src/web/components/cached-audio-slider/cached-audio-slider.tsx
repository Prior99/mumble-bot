import * as React from "react";
import * as classNames from "classnames";
import { bind } from "decko";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { observable } from "mobx";
import * as css from "./cached-audio-slider.scss";
import { CachedAudio } from "../../../common";
import { LiveWebsocket } from "../../store";
import { CachedAudioBlock } from "./cached-audio-block";
import { CachedAudioBrush } from "./cached-audio-brush";

@external @observer
export class CachedAudioSlider extends React.Component {
    @inject private liveWebsocket: LiveWebsocket;

    @observable private brushLeft = 0.3;
    @observable private brushRight = 0.5;

    @bind private handleBrushChange(left: number, right: number) {
        console.log(left, right);
        this.brushLeft = left;
        this.brushRight = right;
    }

    public render() {
        const classes = classNames("ui", "card", "fluid", css.container);
        return (
            <div className={classes}>
                {
                    this.liveWebsocket.allCachedAudios.map(cachedAudio => (
                        <CachedAudioBlock cachedAudio={cachedAudio} key={cachedAudio.id} />
                    ))
                }
                <CachedAudioBrush
                    left={this.brushLeft}
                    right={this.brushRight}
                    onChange={this.handleBrushChange}
                />
                <div />
            </div>
        );
    }
}
