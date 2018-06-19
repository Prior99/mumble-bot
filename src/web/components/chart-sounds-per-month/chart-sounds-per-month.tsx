import * as React from "react";
import { bind } from "decko";
import { inject, external } from "tsdi";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { Card, Dimmer, Loader } from "semantic-ui-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { StatisticsStore } from "../../store";
import { chartColors } from "../../chart-colors";
import { format } from "date-fns";

@observer @external
export class ChartSoundsPerMonth extends React.Component {
    @inject private statistics: StatisticsStore;

    @computed private get loading() {
        return !Boolean(this.statistics.soundsPerMonth);
    }

    @bind private xAxisTickFormatter(index: number) {
        return format(this.statistics.soundsPerMonth[index].month, "YYYY-MM");
    }

    public render() {
        return (
            <Card fluid>
                <Card.Content>Sounds per Month</Card.Content>
                <Dimmer.Dimmable as={Card.Content} dimmed={this.loading}>
                    <Dimmer active={this.loading} inverted>
                        <Loader>Loading</Loader>
                    </Dimmer>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            data={this.statistics.soundsPerMonth}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <XAxis tickFormatter={this.xAxisTickFormatter}/>
                            <YAxis/>
                            <CartesianGrid strokeDasharray="1 3"/>
                            <Tooltip/>
                            <Legend />
                            <Line type="monotone" dataKey="sounds" stroke={chartColors[0]} />
                        </LineChart>
                    </ResponsiveContainer>
                </Dimmer.Dimmable>
            </Card>
        );
    }
}
