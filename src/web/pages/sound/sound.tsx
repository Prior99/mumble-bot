import * as React from "react";
import * as uuid from "uuid";
import { Link } from "react-router-dom";
import { ApiError } from "hyrest";
import { action, observable, computed } from "mobx";
import { distanceInWordsToNow } from "date-fns";
import { observer } from "mobx-react";
import { bind } from "decko";
import { initialize, external, inject } from "tsdi";
import { List, Card, Image, Dimmer, Loader, Icon, Grid, Header, Table } from "semantic-ui-react";
import { SoundCard, Content, SoundSource, MiniUserBadge } from "../../components";
import { Sounds } from "../../../common";
import { routeSound } from "../../routing";
import { SoundsStore } from "../../store";
import { requireLogin } from "../../utils";
import * as css from "./sound.scss";

export interface PageSoundProps {
    readonly match: {
        readonly params: {
            readonly id: string;
        };
    };
}

declare const baseUrl: string;

@requireLogin @external @observer
export class PageSound extends React.Component<PageSoundProps> {
    @inject private sounds: SoundsStore;

    @observable private loading = true;

    public componentWillMount() {
        this.load(this.props.match.params.id);
    }

    public componentWillReceiveProps(props: PageSoundProps) {
        this.load(props.match.params.id);
    }

    private async load(id: string) {
        this.loading = true;
        const sound = await this.sounds.byId(id);
        if (sound.parent) {
            await this.sounds.byId(sound.parent.id);
        }
        if (sound.children) {
            await Promise.all(sound.children.map(child => this.sounds.byId(child.id)));
        }
        this.loading = false;
    }

    @computed private get sound() {
        return this.sounds.sounds.get(this.props.match.params.id);
    }

    @computed private get parent() {
        if (!this.sound.parent) { return; }
        return this.sounds.sounds.get(this.sound.parent.id);
    }

    @computed private get children() {
        if (!this.sound.children) { return; }
        return this.sound.children.map(child => this.sounds.sounds.get(child.id));
    }

    private get visualizationUrl() { return `${baseUrl}/sound/${this.sound.id}/visualized`; }

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
        const { sound, visualizationUrl } = this;
        const { description, created, updated, source, creator, user, used, parent, children } = sound;
        return (
            <Content>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={16}>
                            <h2>{description}</h2>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column width={16}>
                            <Card fluid>
                                <Image className={css.visualization} height={80} src={visualizationUrl} />
                            </Card>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column width={16}>
                            <Table>
                                <Table.Row>
                                    <Table.Cell><Icon name="file text" /> Description</Table.Cell>
                                    <Table.Cell>{description}</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell><Icon name="add to calendar" /> Created</Table.Cell>
                                    <Table.Cell>
                                        {distanceInWordsToNow(created)} ago
                                        ({created.toLocaleString()})
                                    </Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell><Icon name="calendar check" /> Modified</Table.Cell>
                                    <Table.Cell>
                                        {distanceInWordsToNow(updated)} ago
                                        ({updated.toLocaleString()})
                                    </Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell><Icon name="add user" /> Creator</Table.Cell>
                                    <Table.Cell><MiniUserBadge user={creator}/></Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell><Icon name="info" /> Source</Table.Cell>
                                    <Table.Cell><SoundSource sound={sound} /></Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell><Icon name="bar chart" /> Used</Table.Cell>
                                    <Table.Cell>{used}</Table.Cell>
                                </Table.Row>
                                {
                                    this.parent && (
                                        <Table.Row>
                                            <Table.Cell><Icon name="level up" /> Parent</Table.Cell>
                                            <Table.Cell>
                                                <Link to={routeSound.path(this.parent.id)}>
                                                    {this.parent.description}
                                                </Link>
                                            </Table.Cell>
                                        </Table.Row>
                                    )
                                }
                                {
                                    this.children && this.children.length > 0 && (
                                        <Table.Row>
                                            <Table.Cell verticalAlign="top">
                                                <Icon name="level down" /> Children
                                            </Table.Cell>
                                            <Table.Cell>
                                                <List bulleted>
                                                    {
                                                        this.children.map(child => (
                                                            <List.Item key={child.id}>
                                                                <Link to={routeSound.path(child.id)}>
                                                                    {child.description}
                                                                </Link>
                                                            </List.Item>
                                                        ))
                                                    }
                                                </List>
                                            </Table.Cell>
                                        </Table.Row>
                                    )
                                }
                            </Table>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Content>
        );
    }
}
