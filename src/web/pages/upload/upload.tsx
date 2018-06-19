import * as React from "react";
import * as uuid from "uuid";
import { action, observable } from "mobx";
import { observer } from "mobx-react";
import { bind } from "decko";
import { external, inject } from "tsdi";
import { Icon, Grid, Header, Table } from "semantic-ui-react";
import { Content } from "../../components";
import { Sounds } from "../../../common";
import { requireLogin } from "../../utils";
import * as css from "./upload.scss";

interface UploadFile {
    id: string;
    file: File;
    status: "done" | "uploading" | "error";
}

@requireLogin @external @observer
export class PageUpload extends React.Component {
    @inject private sounds: Sounds;

    @observable private files = new Map<string, UploadFile>();

    @bind @action private handleAdd(event: React.SyntheticEvent<HTMLInputElement>) {
        const files = [];
        for (let i = 0; i < event.currentTarget.files.length; ++i) {
            const uploadingFile: UploadFile = {
                id: uuid.v4(),
                file: event.currentTarget.files.item(i),
                status: "uploading",
            };
            files.push(uploadingFile);
        }
        event.currentTarget.files = null;
        files.forEach(async file => await this.upload(file));
        files.forEach(file => this.files.set(file.id, file));
    }

    @bind @action private async upload(file: UploadFile) {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.addEventListener("load", async () => {
                try {
                    await this.sounds.upload({
                        content: btoa(reader.result),
                        filename: file.file.name,
                    });
                    this.files.set(file.id, {
                        ...file,
                        status: "done",
                    });
                } catch (err) {
                    this.files.set(file.id, {
                        ...file,
                        status: "error",
                    });
                }
                resolve();
            });
            reader.readAsBinaryString(file.file);
        });
    }

    @bind private renderUploads() {
        return Array.from(this.files.values()).map(file => (
            <Table.Row key={file.file.name}>
                <Table.Cell>{file.file.name}</Table.Cell>
                <Table.Cell>
                    {
                        file.status === "done" ? <Icon color="green" name="check" /> :
                        file.status === "error" ? <Icon color="red" name="cancel" /> :
                        <Icon color="blue" loading name="spinner" />
                    }
                </Table.Cell>
            </Table.Row>
        ));
    }

    public render() {
        return (
            <Content>
                <Grid>
                    <Grid.Row>
                        <Header as="h2" icon textAlign="center">
                            <Icon name="upload" />
                            <Header.Content>Upload Sounds</Header.Content>
                            <Header.Subheader>Upload sounds from your disk.</Header.Subheader>
                        </Header>
                    </Grid.Row>
                    <Grid.Row>
                       <Grid.Column width={16}>
                            <div className={css.fileWrapper}>
                                <Icon color="grey" className={css.icon}/>
                                <p className={css.fileWrapperBigText}>Drag files here ...</p>
                                <p className={css.fileWrapperSmallText}>... or click and select.</p>
                                <input
                                    type="file"
                                    onChange={this.handleAdd}
                                    multiple />
                            </div>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column width={16}>
                            {
                                this.files.size > 0 && <Table>{this.renderUploads()}</Table>
                            }
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Content>
        );
    }
}
