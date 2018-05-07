import * as React from "react";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { observable } from "mobx";
import { Grid, Header, Icon } from "semantic-ui-react";
import { bind } from "decko";
import { subDays } from "date-fns";
import { requireLogin } from "../../utils";
import { Content, CachedAudioSlider, CachedAudioTimeline } from "../../components";
import { UsersStore, LiveWebsocket } from "../../store";

@requireLogin @observer @external
export class PageCached extends React.Component {
    @inject private users: UsersStore;
    @inject private liveWebsocket: LiveWebsocket;

    @observable private start: Date = subDays(new Date(), 1);
    @observable private end: Date = new Date();

    @bind private handleSilderChange(start: Date, end: Date) {
        this.start = start;
        this.end = end;
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
                            <CachedAudioSlider
                                onChange={this.handleSilderChange}
                                start={this.start}
                                end={this.end}
                            />
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
