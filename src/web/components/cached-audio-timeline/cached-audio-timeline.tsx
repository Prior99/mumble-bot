import * as React from "react";
import * as classNames from "classnames";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { User } from "../../../common";
import { CachedAudioStore } from "../../store";
import { CachedAudioTimelineBlock } from "./cached-audio-timeline-block";
import * as css from "./cached-audio-timeline.scss";

@external @observer
export class CachedAudioTimeline extends React.Component<{ user: User }> {
    @inject private cachedAudio: CachedAudioStore;

    public render() {
        return (
            <div className={css.wrapper}>
                <div className={css.name}>
                    <p>{this.props.user.name}</p>
                </div>
                <div className={classNames(css.timeline, "ui", "card", "fluid")}>
                    <div />
                    {
                        this.cachedAudio.inSelectionByUser(this.props.user).map(cachedAudio => (
                            <CachedAudioTimelineBlock cachedAudio={cachedAudio} key={cachedAudio.id} />
                        ))
                    }
                    <div />
                </div>
            </div>
        );
    }
}
