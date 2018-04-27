import * as React from "react";
import { external } from "tsdi";
import { observer } from "mobx-react";
import { Grid, Card, Header, Icon } from "semantic-ui-react";
import { requireLogin } from "../../../common-ui";
import { Content } from "../../components";
import { ChannelTree } from "../../components";

@requireLogin @observer @external
export class PageDashboard extends React.Component {
    public render() {
        return (
            <Content>
                <Grid>
                    <Grid.Row>
                        <Header as="h2" icon textAlign="center">
                            <Icon name="dashboard" />
                            <Header.Content>Dashboard</Header.Content>
                            <Header.Subheader>Get a quick grasp about what's going on.</Header.Subheader>
                        </Header>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column width={10}>
                        </Grid.Column>
                        <Grid.Column width={6}>
                            <Card fluid>
                                <Card.Content>Server Tree</Card.Content>
                                <Card.Content>
                                    <ChannelTree />
                                </Card.Content>
                            </Card>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Content>
        );
    }
}
