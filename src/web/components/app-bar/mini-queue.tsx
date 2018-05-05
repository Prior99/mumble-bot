import * as React from "react";
import { distanceInWordsStrict, addSeconds } from "date-fns";
import { Progress, Menu } from "semantic-ui-react";
import { inject, external } from "tsdi";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { LiveWebsocket } from "../../store";

@observer @external
export class MiniQueue extends React.Component {
    @inject private liveWebsocket: LiveWebsocket;

    @computed private get totalSeconds() {
        return this.liveWebsocket.queue.reduce((result, queueItem) => result + queueItem.duration, 0);
    }

    @computed private get doneDate() {
        return addSeconds(new Date(), this.totalSeconds);
    }

    @computed private get formattedDuration() {
        return distanceInWordsStrict(new Date(), this.doneDate);
    }

    @computed private get queueCount() {
        return this.liveWebsocket.queue.length;
    }

    public render() {
        if (this.queueCount === 0) {
            return <span>Queue is empty.</span>;
        }
        return (
            <span>
                <b>{this.queueCount}</b> Items in queue. Queue will run for <b>{this.formattedDuration}</b>.
            </span>
        );
    }
}
