import * as React from "react";
import * as classNames from "classnames";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { bind } from "decko";
import { observable, computed, action } from "mobx";
import { Input, Menu, Dropdown, Label, Icon } from "semantic-ui-react";
import { PlaylistsStore } from "../../store";
import * as css from "./quick-list.scss";

@observer @external
export class QuickList extends React.Component {
    @inject private playlists: PlaylistsStore;

    @observable private open = false;
    @observable private loading = false;
    @observable private description = "";

    @computed private get visible() {
        return this.playlists.quickList.length > 0;
    }

    @computed private get descriptionPlaceholder() {
        return `Playlist from ${new Date().toLocaleString()}`;
    }

    @bind @action public async handlePlay() {
        this.loading = true;
        await this.playlists.playQuickList();
        this.loading = false;
    }

    @bind @action public async handleClear() {
        this.playlists.clearQuickList();
    }

    @bind @action public async handleSave() {
        this.loading = true;
        await this.playlists.saveQuickList(this.description || this.descriptionPlaceholder);
        this.loading = false;
    }

    @bind @action public async handleRemoveItem(index: number) {
        if (this.loading) { return; }
        this.playlists.removeQuickListEntry(index);
    }

    @bind @action public handleDropdownToggle() {
        this.open = !this.open;
    }

    @bind @action public handleDescription(event: React.SyntheticInputEvent) {
        this.description = event.currentTarget.value;
    }

    public render() {
        if (!this.visible) { return null; }
        return (
            <div className={css.container}>
                <Menu inverted className={css.quickList}>
                    <Dropdown
                        floating
                        item
                        text="Quicklist"
                        upward
                        closeOnChange={false}
                        closeOnBlur={false}
                        open={this.open}
                        onClick={this.handleDropdownToggle}
                    >
                        <Dropdown.Menu direction="left" disabled={this.loading}>
                            {
                                this.playlists.quickList.map((entry, index) => {
                                    return (
                                        <Dropdown.Item key={index} className={css.item} disabled={this.loading}>
                                            <Icon
                                                onClick={() => this.handleRemoveItem(index)}
                                                name="minus"
                                                className={classNames(
                                                    "right",
                                                    "floated",
                                                    css.icon,
                                                )}
                                            />
                                            <Label circular content={index + 1} />
                                            <span className={css.dropdownContent}>
                                                {entry.sound.description}
                                            </span>
                                        </Dropdown.Item>
                                    );
                                })
                            }
                        </Dropdown.Menu>
                    </Dropdown>
                    <Input
                        onChange={this.handleDescription}
                        inverted
                        icon="file"
                        placeholder={this.descriptionPlaceholder}
                    />
                    <Menu.Item icon="play" color="blue" onClick={this.handlePlay} disabled={this.loading} />
                    <Menu.Item icon="remove" color="red" onClick={this.handleClear} disabled={this.loading} />
                    <Menu.Item icon="save" color="red" onClick={this.handleSave} disabled={this.loading} />
                </Menu>
            </div>
        );
    }
}
