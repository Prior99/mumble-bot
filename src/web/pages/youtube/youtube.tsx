import * as React from "react";
import * as uuid from "uuid";
import { ApiError } from "hyrest";
import { action, observable } from "mobx";
import { observer } from "mobx-react";
import { bind } from "decko";
import { external, inject } from "tsdi";
import { Icon, Grid, Header, Table, Message, Form } from "semantic-ui-react";
import { Content } from "../../components";
import { Sounds } from "../../../common";
import { UsersStore, OwnUserStore } from "../../store";
import { requireLogin } from "../../utils";
import * as css from "./upload.scss";

interface ImportStatus {
    url: string;
    okay: boolean;
    error?: ApiError;
}

@requireLogin @external @observer
export class PageYoutube extends React.Component {
    @inject private sounds: Sounds;

    @observable private url = "";
    @observable private loading = false;
    @observable private imports: ImportStatus[] = [];

    @bind @action private async handleImport() {
        this.loading = true;
        const { url } = this;
        try {
            await this.sounds.importYoutube({ url });
            this.imports.push({ url, okay: true });
        } catch (error) {
            this.imports.push({ url, okay: false, error });
        }
        this.loading = false;
    }

    @bind @action private handleUrlChange({ currentTarget }: React.SyntheticInputEvent) {
        this.url = currentTarget.value;
    }

    @bind private renderMessages() {
        return this.imports.map((status, index) => {
            const { url, okay, error } = status;
            const onDismiss = () => {
                this.imports = this.imports.filter(current => current !== status);
            };
            return (
                <Message key={index} positive={okay} negative={!okay} onDismiss={onDismiss}>
                    <Message.Header>
                        <Icon name={okay ? "check" : "cancel"} /> {okay ? "Success" : "Import Failed"}
                    </Message.Header>
                    {
                        okay ? (
                            <p>
                                YouTube url <a href={url}>{url}</a> successfully imported.
                            </p>
                        ) : (
                            <p>
                                Unabled to import youtube url <a href={url}>{url}</a>:
                                {error.message}
                            </p>
                        )
                    }
                </Message>
            );
        });
    }

    public render() {
        return (
            <Content>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={16}>
                            {this.renderMessages()}
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Header as="h2" icon textAlign="center">
                            <Icon name="youtube play" />
                            <Header.Content>YouTube Importer</Header.Content>
                            <Header.Subheader>Add sounds by importing them from YouTube.</Header.Subheader>
                        </Header>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column width={16}>
                            <Form onSubmit={this.handleImport} loading={this.loading}>
                                <Form.Input
                                    label="URL"
                                    icon="youtube play"
                                    onChange={this.handleUrlChange}
                                />
                                <Form.Button
                                    color="green"
                                    content="Import"
                                    role="submit"
                                    label="Import"
                                    icon="download"
                                />
                            </Form>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Content>
        );
    }
}
