import * as React from "react";
import { distanceInWordsStrict, addSeconds } from "date-fns";
import { Progress } from "semantic-ui-react";
import { inject, external } from "tsdi";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { LiveWebsocket } from "../../store";
import * as css from "./mini-queue.scss";

@observer @external
export class MiniQueue extends React.Component {
    @inject private liveWebsocket: LiveWebsocket;

    @computed private get doneDate() {
        return addSeconds(new Date(), this.liveWebsocket.totalQueueSeconds);
    }

    @computed private get formattedDuration() {
        return distanceInWordsStrict(new Date(), this.doneDate);
    }

    @computed private get queueCount() {
        return this.liveWebsocket.queue.length;
    }

    @computed private get percent() {
        const fraction = this.liveWebsocket.totalQueueSeconds / this.liveWebsocket.maxDurationSinceLastClear;
        return 100 - Math.round(100 * fraction);
    }

    public render() {
        if (this.queueCount === 0) {
            return <span>Queue is empty.</span>;
        }
        return (
            <>
                <Progress
                    percent={this.percent}
                    progress
                    active
                    color="violet"
                    inverted
                    className={css.progress}
                />
                <span>
                    <b>{this.queueCount}</b> Items in queue. Will run for <b>{this.formattedDuration}</b>.
                </span>
            </>
        );
    }
}
