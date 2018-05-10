import * as React from "react";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { distanceInWordsStrict, addSeconds } from "date-fns";
import { Grid, Header, Icon, Dimmer, Loader } from "semantic-ui-react";
import { requireLogin } from "../../utils";
import { Content, PlaylistCard } from "../../components";
import { PlaylistsStore } from "../../store";
import * as css from "./playlists.scss";

@requireLogin @observer @external
export class PagePlaylists extends React.Component {
    @inject private playlists: PlaylistsStore;

    public render() {
        return (
            <Dimmer.Dimmable as={Content} dimmed={this.playlists.loading}>
                <Dimmer active={this.playlists.loading} inverted>
                    <Loader />
                </Dimmer>
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
                        <div className={css.grid}>
                        {
                            !this.playlists.loading && this.playlists.all.map(playlist => (
                                <div className={css.column} key={playlist.id}>
                                    <PlaylistCard playlist={playlist} />
                                </div>
                            ))
                        }
                        </div>
                    </Grid.Row>
                </Grid>
            </Dimmer.Dimmable>
        );
    }
}
