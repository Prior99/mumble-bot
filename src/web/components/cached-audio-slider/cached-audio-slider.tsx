import * as React from "react";
import * as classNames from "classnames";
import { bind } from "decko";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { observable, computed } from "mobx";
import * as css from "./cached-audio-slider.scss";
import { CachedAudio } from "../../../common";
import { CachedAudioStore } from "../../store";
import { CachedAudioBlock } from "./cached-audio-block";
import { CachedAudioBrush } from "./cached-audio-brush";

export interface CachedAudioSliderProps {
    start: Date;
    end: Date;
    onChange: (start: Date, end: Date) => void;
}

@external @observer
export class CachedAudioSlider extends React.Component<CachedAudioSliderProps> {
    @inject private cachedAudio: CachedAudioStore;

    @bind private handleBrushChange(left: number, right: number) {
        const { range, oldestTime } = this.cachedAudio;
        const start = new Date(oldestTime + left * range);
        const end = new Date(oldestTime + right * range);
        this.props.onChange(start, end);
    }

    @computed private get brushLeft() {
        const { range, oldestTime } = this.cachedAudio;
        return (this.props.start.getTime() - oldestTime) / range;
    }

    @computed private get brushRight() {
        const { range, oldestTime } = this.cachedAudio;
        return (this.props.end.getTime() - oldestTime) / range;
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
