import * as React from "react";
import * as classNames from "classnames";
import { bind } from "decko";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { observable, computed } from "mobx";
import { subDays } from "date-fns";
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
        const start = new Date(this.oldestTime + left * this.range);
        const end = new Date(this.oldestTime + right * this.range);
        this.props.onChange(start, end);
    }

    @computed private get oldestTime() {
        const { oldest } = this.cachedAudio;
        if (!oldest) { return subDays(new Date(), 1).getTime(); }
        return this.cachedAudio.oldest.date.getTime();
    }

    @computed private get range() {
        return Date.now() - this.oldestTime;
    }

    @computed private get brushLeft() {
        return (this.props.start.getTime() - this.oldestTime) / this.range;
    }

    @computed private get brushRight() {
        return (this.props.end.getTime() - this.oldestTime) / this.range;
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
