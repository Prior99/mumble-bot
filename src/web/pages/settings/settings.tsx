import * as React from "react";
import { external } from "tsdi";
import { observer } from "mobx-react";
import { Grid, Header, Icon } from "semantic-ui-react";
import { requireLogin } from "../../../common-ui";
import { Content, MumbleLinker } from "../../components";

@requireLogin @observer @external
export class PageSettings extends React.Component {
    public render() {
        return (
            <Content>
                <Grid>
                    <Grid.Row>
                        <Grid.Column>
                            <Header as="h2" icon textAlign="center">
                                <Icon name="settings" />
                                <Header.Content>Settings</Header.Content>
                                <Header.Subheader>Change settings and link mumble users.</Header.Subheader>
                            </Header>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                            <h3>Link Mumble Users</h3>
                            <div>
                                <MumbleLinker />
                            </div>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Content>
        );
    }
}
