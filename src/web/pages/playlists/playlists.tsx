import * as React from "react";
import { bind } from "decko";
import { external, inject, initialize } from "tsdi";
import { observer } from "mobx-react";
import { observable, action, computed } from "mobx";
import {
    Pagination,
    Form,
    Grid,
    Header,
    Icon,
    Dimmer,
    Loader,
    DropdownProps,
    InputProps,
} from "semantic-ui-react";
import { requireLogin } from "../../utils";
import { Content, PlaylistCard } from "../../components";
import { PlaylistsStore, UsersStore } from "../../store";
import * as css from "./playlists.scss";
import { PlaylistsQuery, PlaylistsQueryResult, User } from "../../../common";

const sortOptionValues: PlaylistsQuery[] = [
    { sort: "created", sortDirection: "asc" },
    { sort: "created", sortDirection: "desc" },
    { sort: "used", sortDirection: "asc" },
    { sort: "used", sortDirection: "desc" },
    { sort: "description", sortDirection: "asc" },
    { sort: "description", sortDirection: "desc" },
];

const sortOptions = [
    { key: 0, value: 0, text: "Oldest", icon: "sort content ascending" },
    { key: 1, value: 1, text: "Newest", icon: "sort content descending" },
    { key: 2, value: 2, text: "Least used", icon: "sort numeric ascending" },
    { key: 3, value: 3, text: "Most used", icon: "sort numeric descending" },
    { key: 4, value: 4, text: "A-Z", icon: "sort alphabet ascending" },
    { key: 5, value: 5, text: "Z-A", icon: "sort alphabet descending" },
];

const limit = 12;

@requireLogin @observer @external
export class PagePlaylists extends React.Component {
    @inject private playlists: PlaylistsStore;
    @inject private users: UsersStore;

    @observable private filterSearch = "";
    @observable private filterCreator: User;
    @observable private loading = false;
    @observable private queryResult: PlaylistsQueryResult;
    @observable private sort = 1;

    @initialize
    protected async initialize() {
        this.loading = true;
        await this.query();
        this.loading = false;
    }

    @bind @action private async handleClear(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        this.filterSearch = "";
        this.filterCreator = undefined;
        this.sort = 1;
        await this.query();
    }

    @bind @action private async query(offset?: number) {
        this.loading = true;
        this.queryResult = await this.playlists.query({
            search: this.filterSearch,
            creator: this.filterCreator && this.filterCreator.id,
            ...sortOptionValues[this.sort],
            limit,
            offset,
        });
        this.loading = false;
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
        return Math.floor(this.queryResult.totalPlaylists / limit);
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
                        <Grid.Column>
                            <Header as="h2" icon textAlign="center">
                                <Icon name="list" />
                                <Header.Content>Playlists</Header.Content>
                                <Header.Subheader>Combined playlists from different sounds.</Header.Subheader>
                            </Header>
                        </Grid.Column>
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
                                            label="Search for Creator"
                                            width={3}
                                            placeholder="Username"
                                            search
                                            fluid
                                            selection
                                            options={[ { text: "Anyone" }, ...this.users.dropdownOptions ]}
                                            value={this.filterCreator && this.filterCreator.id}
                                            onChange={this.handleCreatorChange}
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
                        <div className={css.grid}>
                        {
                            this.hasLoaded && this.queryResult.playlists
                                .map(playlist => this.playlists.playlists.get(playlist.id))
                                .map(playlist => (
                                    <div className={css.column} key={playlist.id}>
                                        <PlaylistCard playlist={playlist} />
                                    </div>
                                ))
                        }
                        </div>
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
