import * as React from "react";
import { external } from "tsdi";
import { observer } from "mobx-react";
import { Grid, Card, Header, Icon } from "semantic-ui-react";
import { requireLogin } from "../../../common-ui";
import { Content } from "../../components";

@requireLogin @observer @external
export class PageSettings extends React.Component {
    public render() {
        return (
            <Content>
                <Grid>
                    <Grid.Row>
                        <Header as="h2" icon textAlign="center">
                            <Icon name="settings" />
                            <Header.Content>Settings</Header.Content>
                            <Header.Subheader>Change settings and link mumble users.</Header.Subheader>
                        </Header>
                    </Grid.Row>
                    <Grid.Row>
                    </Grid.Row>
                </Grid>
            </Content>
        );
    }
}
