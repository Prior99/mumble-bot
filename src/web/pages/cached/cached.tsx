import * as React from "react";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { Grid, Header, Icon } from "semantic-ui-react";
import { requireLogin } from "../../utils";
import { Content, MumbleLinker, CachedAudioSlider, CachedAudioTimeline } from "../../components";
import { UsersStore } from "../../store";

@requireLogin @observer @external
export class PageCached extends React.Component {
    @inject private users: UsersStore;

    public render() {
        return (
            <Content>
                <Grid>
                    <Grid.Row>
                        <Grid.Column>
                            <Header as="h2" icon textAlign="center">
                                <Icon name="history" />
                                <Header.Content>Cached Audios</Header.Content>
                                <Header.Subheader>Save recordings from linked users.</Header.Subheader>
                            </Header>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                            <CachedAudioSlider />
                            {
                                this.users.all.map(user => <CachedAudioTimeline user={user} key={user.id} />)
                            }
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Content>
        );
    }
}
