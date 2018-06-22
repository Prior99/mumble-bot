import * as React from "react";
import { bind } from "decko";
import { inject, external } from "tsdi";
import { observer } from "mobx-react";
import { computed, action, observable } from "mobx";
import { Card, Dimmer, Loader } from "semantic-ui-react";
import { PieChart, Pie } from "recharts";
import { StatisticsStore, UsersStore } from "../../store";
import { chartColors } from "../../chart-colors";
import { ActiveShape } from "../active-shape";

@observer @external
export class ChartRecordingsPerUser extends React.Component {
    @inject private statistics: StatisticsStore;
    @inject private users: UsersStore;

    @observable private activeIndex = 0;

    @computed private get loading() {
        return !Boolean(this.statistics.recordingsPerUser);
    }

    @computed private get data(): { name: string, value: number }[] {
        if (this.loading) { return []; }
        return this.statistics.recordingsPerUser
            .map(({ user, recordings }, index) => ({
                name: this.users.byId(user.id).name,
                value: recordings,
                fill: chartColors[index % chartColors.length],
            }))
            .sort((a, b) => a.value - b.value);
    }

    @bind @action
    private doPieEnter(_, index: number) {
        this.activeIndex = index;
    }

    public render() {
        return (
            <Card fluid>
                <Card.Content>Recordings per User</Card.Content>
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
