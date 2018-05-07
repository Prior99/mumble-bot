import * as React from "react";
import * as classNames from "classnames";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { CachedAudio } from "../../../common";
import { CachedAudioStore } from "../../store";
import * as css from "./cached-audio-timeline-block.scss";

export interface BlockInfo {
    status: "offline" | "quiet" | "speech";
    cachedAudio?: CachedAudio;
    start: Date;
    end: Date;
}

@external @observer
export class CachedAudioTimelineBlock extends React.Component<{ info: BlockInfo }> {
    @inject private cachedAudio: CachedAudioStore;

    @computed private get range() {
        const { oldest } = this.cachedAudio;
        return Date.now() - oldest.date.getTime();
    }

    @computed private get left() {
        const { cachedAudio, props, range } = this;
        const { oldest } = cachedAudio;
        return (props.info.start.getTime() - oldest.date.getTime()) / range;
    }

    @computed private get duration() {
        return this.props.info.end.getTime() - this.props.info.start.getTime();
    }

    @computed private get width() {
        return this.duration / this.range;
    }

    public render() {
        const { left, width } = this;
        const classes = classNames(css.block, "inverted", "violet");
        return (
            <div className={classes} style={{ left, width }} />
        );
    }
}
