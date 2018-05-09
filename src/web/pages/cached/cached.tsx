import * as React from "react";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { distanceInWordsStrict, addSeconds } from "date-fns";
import { Grid, Header, Icon, Dimmer, Loader } from "semantic-ui-react";
import { requireLogin } from "../../utils";
import { Content, CachedAudioSlider, CachedAudioTimeline } from "../../components";
import { UsersStore, CachedAudioStore, LiveWebsocket } from "../../store";
import * as css from "./cached.scss";

@requireLogin @observer @external
export class PageCached extends React.Component {
    @inject private users: UsersStore;
    @inject private cachedAudio: CachedAudioStore;
    @inject private liveWebsocket: LiveWebsocket;

    @computed private get visibleUsers() {
        return this.users.alphabetical.filter(user => this.cachedAudio.inSelectionByUser(user).length > 0);
    }

    @computed private get totalDuration() {
        return distanceInWordsStrict(new Date(0), addSeconds(new Date(0), this.cachedAudio.totalDuration));
    }

    @computed private get statsString() {
        return `${this.cachedAudio.all.length} audios with a total duration of ${this.totalDuration}.`;
    }

    @computed private get rangeString() {
        const { selectionStart, selectionEnd } = this.cachedAudio;
        return `${distanceInWordsStrict(selectionStart, selectionEnd)} selected.`;
    }

    public render() {
        return (
            <Dimmer.Dimmable as={Content} dimmed={this.liveWebsocket.loading}>
                <Dimmer active={this.liveWebsocket.loading} inverted>
                    <Loader />
                </Dimmer>
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
                            <div className={css.info}>
                                <div><Icon name="bar graph" /> {this.statsString}</div>
                                {
                                    this.cachedAudio.selectionDefined && (
                                        <div><Icon name="time" /> {this.rangeString}</div>
                                    )
                                }
                                {
                                    this.cachedAudio.selectionFollowing && (
                                        <div><Icon name="refresh" /> Following.</div>
                                    )
                                }
                            </div>
                            <CachedAudioSlider />
                            {
                                this.visibleUsers.map(user => <CachedAudioTimeline user={user} key={user.id} />)
                            }
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Dimmer.Dimmable>
        );
    }
}
