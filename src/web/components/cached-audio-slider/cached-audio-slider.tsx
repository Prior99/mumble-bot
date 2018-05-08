import * as React from "react";
import * as classNames from "classnames";
import { bind } from "decko";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { computed } from "mobx";
import * as css from "./cached-audio-slider.scss";
import { CachedAudioStore } from "../../store";
import { CachedAudioBlock } from "./cached-audio-block";
import { CachedAudioBrush } from "./cached-audio-brush";

@external @observer
export class CachedAudioSlider extends React.Component {
    @inject private cachedAudio: CachedAudioStore;

    @bind private handleBrushChange(left: number, right: number) {
        const { totalRange, oldestTime } = this.cachedAudio;
        this.cachedAudio.selectionStart = new Date(oldestTime + left * totalRange);
        this.cachedAudio.selectionEnd = new Date(oldestTime + right * totalRange);
    }

    @computed private get brushLeft() {
        const { totalRange, selectionStart, oldestTime } = this.cachedAudio;
        return (selectionStart.getTime() - oldestTime) / totalRange;
    }

    @computed private get brushRight() {
        const { totalRange, oldestTime, selectionEnd } = this.cachedAudio;
        return (selectionEnd.getTime() - oldestTime) / totalRange;
    }

    public render() {
        const classes = classNames("ui", "card", "fluid", css.container);
        return (
            <div className={classes}>
                <div />
                {
                    this.cachedAudio.all.map(cachedAudio => (
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
