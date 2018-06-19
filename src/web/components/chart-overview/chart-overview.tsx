import * as React from "react";
import { inject, external } from "tsdi";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { Card, Dimmer, Loader, Statistic } from "semantic-ui-react";
import { StatisticsStore } from "../../store";
import * as css from "./overview.scss";

@observer @external
export class ChartOverview extends React.Component {
    @inject private statistics: StatisticsStore;

    @computed private get loading() {
        return !Boolean(this.statistics.soundsPerSource);
    }

    @computed private get tagItems() {
        if (this.loading) { return []; }
        const {
            totalUntagged,
            totalTags,
            totalTagged,
        } = this.statistics.overview;
        return [
            {
                key: "totalTags",
                label: "Tags",
                value: totalTags.toLocaleString(),
                color: "grey",
            },
            {
                key: "totalTagged",
                label: "Taggings",
                value: totalTagged.toLocaleString(),
                color: "grey",
            },
            {
                key: "totalUntagged",
                label: "Untagged",
                value: totalUntagged.toLocaleString(),
                color: "red",
            },
        ];
    }

    @computed private get soundItems() {
        if (this.loading) { return []; }
        const {
            totalSounds,
            totalUnrated,
            totalPlaybacks,
        } = this.statistics.overview;
        return [
            {
                key: "totalSounds",
                label: "Sounds",
                value: totalSounds.toLocaleString(),
                color: "green",
            },
            {
                key: "totalUnrated",
                label: "Unrated",
                value: totalUnrated.toLocaleString(),
                color: "red",
            },
            {
                key: "totalPlaybacks",
                label: "Playbacks",
                value: totalPlaybacks.toLocaleString(),
                color: "blue",
            },
        ];
    }

    public render() {
        return (
            <Card fluid>
                <Card.Content>Overview</Card.Content>
                <Dimmer.Dimmable as={Card.Content} dimmed={this.loading}>
                    <Dimmer active={this.loading} inverted>
                        <Loader>Loading</Loader>
                    </Dimmer>
                    <Statistic.Group className={css.statistics} items={this.tagItems} />
                    <Statistic.Group className={css.statistics} items={this.soundItems} />
                </Dimmer.Dimmable>
            </Card>
        );
    }
}
