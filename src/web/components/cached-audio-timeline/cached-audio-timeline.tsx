import * as React from "react";
import { external } from "tsdi";
import { observer } from "mobx-react";
import { User, CachedAudio } from "../../../common";
import { CachedAudioTimelineBlock, BlockInfo } from "./cached-audio-timeline-block";

@external @observer
export class CachedAudioTimeline extends React.Component<{ user: User }> {
    public render() {
        return (
            <div>
                
            </div>
        );
    }
}
