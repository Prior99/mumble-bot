import * as React from "react";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { Grid, Header, Icon } from "semantic-ui-react";
import { bind } from "decko";
import { subDays } from "date-fns";
import { requireLogin } from "../../utils";
import { Content, CachedAudioSlider, CachedAudioTimeline } from "../../components";
import { UsersStore, CachedAudioStore } from "../../store";

@requireLogin @observer @external
export class PageCached extends React.Component {
    @inject private users: UsersStore;
    @inject private cachedAudio: CachedAudioStore;

    @computed private get visibleUsers() {
        return this.users.alphabetical.filter(user => this.cachedAudio.inSelectionByUser(user).length > 0);
    }

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
                                this.visibleUsers.map(user => <CachedAudioTimeline user={user} key={user.id} />)
                            }
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Content>
        );
    }
}
