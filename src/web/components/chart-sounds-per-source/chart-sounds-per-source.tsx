import * as React from "react";
import { bind } from "decko";
import { inject, external } from "tsdi";
import { observer } from "mobx-react";
import { computed, action, observable } from "mobx";
import { Card, Dimmer, Loader } from "semantic-ui-react";
import { PieChart, Pie } from "recharts";
import { StatisticsStore } from "../../store";
import { chartColors } from "../../chart-colors";
import { ActiveShape } from "../active-shape";

const sourceNames = {
    recording: "Recorded",
    youtube: "YouTube",
    upload: "Uploaded",
};

@observer @external
export class ChartSoundsPerSource extends React.Component {
    @inject private statistics: StatisticsStore;

    @observable private activeIndex = 0;

    @computed private get loading() {
        return !Boolean(this.statistics.soundsPerSource);
    }

    @computed private get data(): { name: string, value: number }[] {
        if (this.loading) { return; }
        return this.statistics.soundsPerSource
            .map(({ source, sounds }, index) => ({
                name: sourceNames[source],
                value: sounds,
                fill: chartColors[index % chartColors.length],
            }))
            .sort((a, b) => {
                if (a.value > b.value) { return 1; }
                if (a.value < b.value) { return -1; }
                return 0;
            });
    }

    @bind @action
    private doPieEnter(_, index: number) {
        this.activeIndex = index;
    }

    public render() {
        return (
            <Card fluid>
                <Card.Content>Sounds per Source</Card.Content>
                <Dimmer.Dimmable as={Card.Content} dimmed={this.loading}>
                    <Dimmer active={this.loading} inverted>
                        <Loader>Loading</Loader>
                    </Dimmer>
                    <PieChart style={{ margin: "auto" }} width={500} height={300}>
                        {
                            this.data && (
                                <Pie
                                    activeIndex={this.activeIndex}
                                    activeShape={ActiveShape}
                                    data={this.data}
                                    cx={250}
                                    cy={150}
                                    innerRadius={80}
                                    outerRadius={110}
                                    onMouseEnter={this.doPieEnter}
                                    dataKey="value"
                                />
                            )
                        }
                    </PieChart>
                </Dimmer.Dimmable>
            </Card>
        );
    }
}
