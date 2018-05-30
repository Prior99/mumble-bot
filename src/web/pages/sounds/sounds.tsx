import * as React from "react";
import { external, inject, initialize } from "tsdi";
import { observer } from "mobx-react";
import { bind } from "decko";
import { observable, computed, action } from "mobx";
import {
    Grid,
    Header,
    Icon,
    Form,
    Pagination,
    Dimmer,
    Loader,
    DropdownProps,
    InputProps,
} from "semantic-ui-react";
import { requireLogin } from "../../utils";
import { SoundsStore, TagsStore, UsersStore } from "../../store";
import { SoundCard, Content } from "../../components";
import { Tag, User, SoundsQuery , SoundsQueryResult } from "../../../common";
import * as css from "./sounds.scss";

const sortOptionValues: SoundsQuery[] = [
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

const sourceOptions = [
    {
        key: "any",
        text: "Any",
    },
    {
        key: "recording",
        value: "recording",
        text: "Recording",
        icon: "microphone",
    },
    {
        key: "upload",
        value: "upload",
        text: "Upload",
        icon: "upload",
    },
    {
        key: "youtube",
        value: "youtube",
        text: "YouTube",
        icon: "youtube play",
    },
];

const sortOptions = [
    { key: 0, value: 0, text: "Oldest", icon: "sort content ascending" },
    { key: 1, value: 1, text: "Newest", icon: "sort content descending" },
    { key: 2, value: 2, text: "Not played", icon: "sort content ascending" },
    { key: 3, value: 3, text: "Last played", icon: "sort content descending" },
    { key: 4, value: 4, text: "Least used", icon: "sort numeric ascending" },
    { key: 5, value: 5, text: "Most used", icon: "sort numeric descending" },
    { key: 6, value: 6, text: "Shortest", icon: "sort content ascending" },
    { key: 7, value: 7, text: "Longest", icon: "sort content descending" },
    { key: 8, value: 8, text: "A-Z", icon: "sort alphabet ascending" },
    { key: 9, value: 9, text: "Z-A", icon: "sort alphabet descending" },
];

const limit = 48;

@requireLogin @external @observer
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
    @observable private queryResult: SoundsQueryResult;
    @observable private sort = 1;

    @initialize
    protected async initialize() {
        this.loading = true;
        await this.query();
        this.loading = false;
    }

    @bind @action private async handleClear(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        this.filterTags = [];
        this.filterSearch = "";
        this.filterUser = undefined;
        this.filterCreator = undefined;
        this.filterSource = undefined;
        this.sort = 1;
        await this.query();
    }

    @bind @action private async query(offset?: number) {
        this.loading = true;
        this.queryResult = await this.sounds.query({
            tags: this.filterTags.map(tag => tag.id),
            search: this.filterSearch,
            creator: this.filterCreator && this.filterCreator.id,
            user: this.filterUser && this.filterUser.id,
            source: this.filterSource,
            ...sortOptionValues[this.sort],
            limit,
            offset,
        });
        this.loading = false;
    }

    @bind @action private handleTagChange(_, { value }: DropdownProps) {
        this.filterTags = (value as string[]).map(tagId => this.tags.byId(tagId));
    }

    @bind @action private handleUserChange(_, { value }: DropdownProps) {
        this.filterUser = this.users.byId(value as string);
    }

    @bind @action private handleCreatorChange(_, { value }: DropdownProps) {
        this.filterCreator = this.users.byId(value as string);
    }

    @bind @action private handleSearchChange(_, { value }: InputProps) {
        this.filterSearch = value;
    }

    @bind @action private handleSortChange(_, { value }: DropdownProps) {
        this.sort = Number(value);
    }

    @bind @action private handleSourceChange(_, { value }: DropdownProps) {
        this.filterSource = value as "upload" | "recording";
    }

    @bind private getPaginationEventPage({ currentTarget }: React.SyntheticEvent<HTMLAnchorElement>) {
        const { type, text } = currentTarget;
        switch (type) {
            case "prevItem": return this.activePage - 1;
            case "nextItem": return this.activePage + 1;
            case "firstItem": return 1;
            case "lastItem": return this.totalPages;
            case "pageItem": return Number(text);
            default: return 1;
        }
    }

    @bind @action private async handlePageChange(event: React.SyntheticEvent<HTMLAnchorElement>) {
        await this.query(this.getPaginationEventPage(event) * limit);
    }

    @bind @action private async handleSearchSubmit() {
        await this.query();
    }

    @computed private get totalPages() {
        if (!this.queryResult) { return 1; }
        return Math.floor(this.queryResult.totalSounds / limit);
    }

    @computed private get hasLoaded() {
        return this.queryResult !== undefined;
    }

    @computed private get activePage() {
        if (!this.queryResult) { return 1; }
        return Math.max(Math.ceil((this.queryResult.offset || 0) / limit), 1);
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
                    <Dimmer.Dimmable as={Grid.Row} dimmed={this.loading}>
                        <Dimmer active={this.loading} inverted>
                            <Loader>Loading</Loader>
                        </Dimmer>
                        <Grid.Column width={16}>
                            <Form onSubmit={this.handleSearchSubmit}>
                                    <Form.Group>
                                        <Form.Input
                                            icon="search"
                                            label="Search in description"
                                            width={4}
                                            placeholder="Fulltext search"
                                            value={this.filterSearch}
                                            onChange={this.handleSearchChange}
                                        />
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
                                            value={this.filterTags.map(tag => tag.id)}
                                            closeOnChange={false}
                                            multiple
                                        />
                                        <Form.Dropdown
                                            label="Search for User"
                                            width={4}
                                            placeholder="Username"
                                            search
                                            fluid
                                            selection
                                            options={[ { text: "Anyone" }, ...this.users.dropdownOptions ]}
                                            value={this.filterUser && this.filterUser.id}
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
                                            value={this.filterCreator && this.filterCreator.id}
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
                                            options={sourceOptions}
                                            value={this.filterSource}
                                            onChange={this.handleSourceChange}
                                        />
                                        <Form.Dropdown
                                            label="Sort"
                                            width={4}
                                            placeholder="Sort"
                                            selection
                                            fluid
                                            onChange={this.handleSortChange}
                                            defaultValue={1}
                                            value={this.sort}
                                            options={sortOptions}
                                        />
                                        <Form.Button
                                            fluid
                                            width={3}
                                            icon
                                            labelPosition="left"
                                            label="Search"
                                            color="green"
                                        >
                                            Search <Icon name="search" />
                                        </Form.Button>
                                        <Form.Button
                                            fluid
                                            width={2}
                                            label="Clear"
                                            icon="close"
                                            onClick={this.handleClear}
                                        />
                                    </Form.Group>
                            </Form>
                        </Grid.Column>
                        {
                            this.hasLoaded && this.queryResult.sounds
                                .map(sound => this.sounds.sounds.get(sound.id))
                                .filter(sound => !Boolean(sound.deleted))
                                .map(sound => (
                                    <Grid.Column
                                        className={css.column}
                                        mobile={16}
                                        tablet={8}
                                        computer={4}
                                        key={sound.id}
                                    >
                                        <SoundCard id={sound.id} />
                                    </Grid.Column>
                                ))
                        }
                        <Grid.Column width={16}>
                            <Pagination
                                stackable
                                ellipsisItem={{ content: <Icon name="ellipsis horizontal" />, icon: true }}
                                firstItem={{ content: <Icon name="angle double left" />, icon: true }}
                                lastItem={{ content: <Icon name="angle double right" />, icon: true }}
                                prevItem={{ content: <Icon name="angle left" />, icon: true }}
                                nextItem={{ content: <Icon name="angle right" />, icon: true }}
                                totalPages={this.totalPages}
                                activePage={this.activePage}
                                onPageChange={this.handlePageChange}
                                siblingRange={3}
                            />
                        </Grid.Column>
                    </Dimmer.Dimmable>
                </Grid>
            </Content>
        );
    }
}
