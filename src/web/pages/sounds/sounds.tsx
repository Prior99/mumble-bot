import { Sound } from "../../../common";
import * as React from "react";
import { external, inject, initialize } from "tsdi";
import { observer } from "mobx-react";
import { bind } from "decko";
import { observable, computed, action } from "mobx";
import { Grid, Header, Icon, Dropdown, Form } from "semantic-ui-react";
import { requireLogin } from "../../utils";
import { SoundsStore, TagsStore, UsersStore } from "../../store";
import { SoundCard, Content } from "../../components";
import { Tag, User, SoundsQuery  } from "../../../common";
import * as css from "./sounds.scss";

const sortOptions: SoundsQuery[] = [
    { sort: "created", sortDirection: "asc" },
    { sort: "created", sortDirection: "desc" },
    { sort: "updated", sortDirection: "asc" },
    { sort: "updated", sortDirection: "desc" },
    { sort: "used", sortDirection: "asc" },
    { sort: "used", sortDirection: "desc" },
    { sort: "duration", sortDirection: "asc" },
    { sort: "duration", sortDirection: "desc" },
    { sort: "description", sortDirection: "asc" },
    { sort: "description", sortDirection: "desc" },
];

@requireLogin @observer @external
export class PageSounds extends React.Component {
    @inject private sounds: SoundsStore;
    @inject private tags: TagsStore;
    @inject private users: UsersStore;

    @observable private filterTags: Tag[] = [];
    @observable private filterSearch = "";
    @observable private filterUser: User;
    @observable private filterCreator: User;
    @observable private filterSource: "upload" | "recording";
    @observable private loading = false;
    @observable private queryResult: Sound[];
    @observable private sort = sortOptions[1];

    @bind @action private async query() {
        this.loading = true;
        this.queryResult = await this.sounds.query({
            tags: this.filterTags.map(tag => tag.id),
            search: this.filterSearch,
            creator: this.filterCreator && this.filterCreator.id,
            user: this.filterUser && this.filterUser.id,
            source: this.filterSource,
            ...this.sort,
            limit: 20,
        });
        this.loading = false;
    }

    @computed private get visibleEntries() {
        if (this.queryResult) { return this.queryResult; }
        if (!this.sounds) { return []; }
        return this.sounds.initial;
    }

    @bind @action private handleTagChange(_: React.SyntheticInputEvent, { value }: { value: string[] }) {
        this.filterTags = value.map(tagId => this.tags.byId(tagId));
    }

    @bind @action private handleUserChange(_: React.SyntheticInputEvent, { value }: { value: string }) {
        this.filterUser = this.users.byId(value);
    }

    @bind @action private handleCreatorChange(_: React.SyntheticInputEvent, { value }: { value: string }) {
        this.filterCreator = this.users.byId(value);
    }

    @bind @action private handleSearchChange(_: React.SyntheticInputEvent, { value }: { value: string }) {
        this.filterSearch = value;
    }

    @bind @action private handleSortChange(_: React.SyntheticInputEvent, { value }: { value: number }) {
        this.sort = sortOptions[value];
    }

    @bind @action private handleSourceChange(_: React.SyntheticInputEvent, { value }: { value: string }) {
        this.filterSource = value as "upload" | "recording";
    }

    @bind @action private async handleSearchSubmit() {
        await this.query();
    }

    public render() {
        return (
            <Content>
                <Grid>
                    <Grid.Row>
                        <Header as="h2" icon textAlign="center">
                            <Icon name="music" />
                            <Header.Content>Sounds</Header.Content>
                            <Header.Subheader>All sounds on this server.</Header.Subheader>
                        </Header>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                            <Form loading={this.loading} onSubmit={this.handleSearchSubmit}>
                                    <Form.Group>
                                        <Form.Dropdown
                                            label="Search for Tag"
                                            width={4}
                                            placeholder="Tag"
                                            search
                                            fluid
                                            selection
                                            selectOnNavigation={false}
                                            selectOnBlur={false}
                                            options={this.tags.dropdownOptions}
                                            onChange={this.handleTagChange}
                                            closeOnChange={false}
                                            multiple
                                        />
                                        <Form.Input
                                            icon="search"
                                            label="Search in description"
                                            width={4}
                                            placeholder="Fulltext search"
                                            onChange={this.handleSearchChange}
                                        />
                                        <Form.Dropdown
                                            label="Search for User"
                                            width={4}
                                            placeholder="Username"
                                            search
                                            fluid
                                            selection
                                            options={[ { text: "Anyone" }, ...this.users.dropdownOptions ]}
                                            onChange={this.handleUserChange}
                                        />
                                        <Form.Dropdown
                                            label="Search for Creator"
                                            width={4}
                                            placeholder="Username"
                                            search
                                            fluid
                                            selection
                                            options={[ { text: "Anyone" }, ...this.users.dropdownOptions ]}
                                            onChange={this.handleCreatorChange}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Dropdown
                                            label="Source"
                                            width={4}
                                            placeholder="Source"
                                            selection
                                            fluid
                                            options={[
                                                { text: "Any" },
                                                { value: "recording", text: "Recording", icon: "microphone" },
                                                { value: "upload", text: "Upload", icon: "upload" },
                                            ]}
                                            onChange={this.handleSourceChange}
                                        />
                                        <Form.Dropdown
                                            label="Sort"
                                            width={4}
                                            placeholder="Sort"
                                            selection
                                            fluid
                                            onChange={this.handleSortChange}
                                            defaultValue={0}
                                            options={[
                                                { value: 0, text: "Created", icon: "sort content ascending" },
                                                { value: 1, text: "Created", icon: "sort content descending" },
                                                { value: 2, text: "Modified", icon: "sort content ascending" },
                                                { value: 3, text: "Modified", icon: "sort content descending" },
                                                { value: 4, text: "Usages", icon: "sort numeric ascending" },
                                                { value: 5, text: "Usages", icon: "sort numeric descending" },
                                                { value: 6, text: "Duration", icon: "sort content ascending" },
                                                { value: 7, text: "Duration", icon: "sort content descending" },
                                                { value: 8, text: "Name", icon: "sort alphabet ascending" },
                                                { value: 9, text: "Name", icon: "sort alphabet descending" },
                                            ]}
                                        />
                                        <Form.Button fluid width={1} label="Search" icon="search" />
                                    </Form.Group>
                            </Form>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                            {
                                this.visibleEntries.map(sound => (
                                    <Grid.Column
                                        className={css.column}
                                        mobile={16}
                                        tablet={8}
                                        computer={4}
                                        key={sound.id}
                                    >
                                        <SoundCard sound={sound} />
                                    </Grid.Column>
                                ))
                            }
                    </Grid.Row>
                </Grid>
            </Content>
        );
    }
}
