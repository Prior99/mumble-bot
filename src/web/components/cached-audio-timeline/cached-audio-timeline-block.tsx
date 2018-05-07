import * as React from "react";
import * as classNames from "classnames";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { CachedAudio } from "../../../common";
import { CachedAudioStore } from "../../store";
import * as css from "./cached-audio-timeline-block.scss";

@external @observer
export class CachedAudioTimelineBlock extends React.Component<{ cachedAudio: CachedAudio }> {
    @inject private cachedAudio: CachedAudioStore;

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

    public render() {
        const classes = classNames(css.block, "inverted", "violet");
        const left = `${100 * this.left}%`;
        const width = `${100 * this.width}%`;
        return (
            <div className={classes} style={{ left, width }} />
        );
    }
}
