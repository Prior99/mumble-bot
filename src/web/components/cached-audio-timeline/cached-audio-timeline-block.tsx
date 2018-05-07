import * as React from "react";
import * as classNames from "classnames";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { CachedAudio } from "../../../common";
import { LiveWebsocket } from "../../store";
import * as css from "./cached-audio-timeline-block.scss";

export interface BlockInfo {
    status: "offline" | "quiet" | "speech";
    cachedAudio?: CachedAudio;
    start: Date;
    end: Date;
}

@external @observer
export class CachedAudioTimelineBlock extends React.Component<{ info: BlockInfo }> {
    @inject private liveWebsocket: LiveWebsocket;

    @computed private get range() {
        const { oldestCachedAudio, newestCachedAudio } = this.liveWebsocket;
        return newestCachedAudio.date.getTime() - oldestCachedAudio.date.getTime();
    }

    @computed private get left() {
        const { liveWebsocket, props, range } = this;
        const { oldestCachedAudio } = liveWebsocket;
        return (props.info.start.getTime() - oldestCachedAudio.date.getTime()) / range;
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
