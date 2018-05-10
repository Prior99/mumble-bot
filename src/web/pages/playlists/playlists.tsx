import * as React from "react";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { distanceInWordsStrict, addSeconds } from "date-fns";
import { Grid, Header, Icon, Dimmer, Loader } from "semantic-ui-react";
import { requireLogin } from "../../utils";
import { Content, CachedAudioSlider, CachedAudioTimeline } from "../../components";
import { UsersStore, CachedAudioStore, LiveWebsocket, PlaylistsStore } from "../../store";

@requireLogin @observer @external
export class PagePlaylists extends React.Component {
    @inject private Playlists: PlaylistsStore;

    public render() {
        return (
            <Content>
                <Grid>
                    <Grid.Row>
                        <Grid.Column>
                            <Header as="h2" icon textAlign="center">
                                <Icon name="list" />
                                <Header.Content>Playlists</Header.Content>
                                <Header.Subheader>Combined playlists from different sounds.</Header.Subheader>
                            </Header>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                    </Grid.Row>
                </Grid>
            </Content>
        );
    }
}
