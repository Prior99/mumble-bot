import * as React from "react";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { Grid, Card, Header, Icon } from "semantic-ui-react";
import { requireLogin } from "../../utils";
import { SoundsStore } from "../../store";
import { SoundCard, Content } from "../../components";

@requireLogin @observer @external
export class PageSounds extends React.Component {
    @inject private sounds: SoundsStore;

    public render() {
        return (
            <Content>
                <Grid relaxed>
                    <Grid.Row>
                        <Header as="h2" icon textAlign="center">
                            <Icon name="music" />
                            <Header.Content>Sounds</Header.Content>
                            <Header.Subheader>All sounds on this server.</Header.Subheader>
                        </Header>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid>
                            {
                                this.sounds.all.map(sound => (
                                    <Grid.Column mobile={16} tablet={8} computer={4} key={sound.id}>
                                        <SoundCard sound={sound} />
                                    </Grid.Column>
                                ))
                            }
                        </Grid>
                    </Grid.Row>
                </Grid>
            </Content>
        );
    }
}
