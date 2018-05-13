import * as React from "react";
import { observable, computed } from "mobx";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { Dimmer, Loader, Grid } from "semantic-ui-react";
import { Content, Forker } from "../../components";
import { SoundsStore } from "../../store";
import { requireLogin } from "../../utils";

export interface PageForkProps {
    readonly match: {
        readonly params: {
            readonly id: string;
        };
    };
}

@requireLogin @external @observer
export class PageFork extends React.Component<PageForkProps> {
    @inject private sounds: SoundsStore;

    @observable private loading = true;

    public componentWillMount() {
        this.load(this.props.match.params.id);
    }

    public componentWillReceiveProps(props: PageForkProps) {
        this.load(props.match.params.id);
    }

    private async load(id: string) {
        this.loading = true;
        const sound = await this.sounds.byId(id);
        this.loading = false;
    }

    @computed private get sound() {
        return this.sounds.sounds.get(this.props.match.params.id);
    }

    public render() {
        if (this.loading) {
            return (
                <Dimmer.Dimmable dimmed={this.loading}>
                    <Dimmer active={this.loading} inverted>
                        <Loader>Loading</Loader>
                    </Dimmer>
                </Dimmer.Dimmable>
            );
        }
        return (
            <Content>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={16}>
                            <h2>{this.sound.description}</h2>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column width={16}>
                            <Forker id={this.sound.id} />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Content>
        );
    }
}
