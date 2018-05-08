import * as React from "react";
import * as classNames from "classnames";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { CachedAudio } from "../../../common";
import { CachedAudioStore } from "../../store";
import * as css from "./cached-audio-block.scss";

@external @observer
export class CachedAudioBlock extends React.Component<{ cachedAudio: CachedAudio }> {
    @inject private cachedAudio: CachedAudioStore;

    @computed private get left() {
        const { cachedAudio, props } = this;
        const { oldestTime, totalRange } = cachedAudio;
        return (props.cachedAudio.date.getTime() - oldestTime) / totalRange;
    }

    @computed private get width() {
        return this.props.cachedAudio.duration * 1000 / this.cachedAudio.totalRange;
    }

    public render() {
        const left = `${this.left * 100}%`;
        const width = `${this.width * 100}%`;
        const classes = classNames(css.block);
        return (
            <div className={classes} style={{ left, width }} />
        );
    }
}
