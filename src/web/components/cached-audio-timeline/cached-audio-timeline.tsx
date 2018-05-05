import * as React from "react";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { User } from "../../../common";

@external @observer
export class CachedAudioTimeline extends React.Component<{ user: User }> {
    public render() {
        return (
            <div>
            </div>
        );
    }
}
