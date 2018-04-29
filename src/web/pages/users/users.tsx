import * as React from "react";
import { external } from "tsdi";
import { observer } from "mobx-react";
import { Grid, Header, Icon } from "semantic-ui-react";
import { requireLogin } from "../../utils";
import { Content, UserList } from "../../components";

@requireLogin @observer @external
export class PageUsers extends React.Component {
    public render() {
        return (
            <Content>
                <Grid>
                    <Grid.Row>
                        <Grid.Column>
                            <Header as="h2" icon textAlign="center">
                                <Icon name="group" />
                                <Header.Content>Users</Header.Content>
                                <Header.Subheader>View a list of all known users.</Header.Subheader>
                            </Header>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                            <h3>Users</h3>
                            <div>
                                <UserList />
                            </div>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Content>
        );
    }
}
