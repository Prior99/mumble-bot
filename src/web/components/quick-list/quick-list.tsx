import * as React from "react";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { bind } from "decko";
import { observable, computed, action } from "mobx";
import { Menu, Dropdown } from "semantic-ui-react";
import { PlaylistsStore } from "../../store";
import * as css from "./quick-list.scss";

@observer @external
export class QuickList extends React.Component {
    @inject private playlists: PlaylistsStore;

    @observable private open = false;
    @observable private loading = false;

    @computed private get visible() {
        return this.playlists.quickList.length > 0;
    }

    @bind @action public async handlePlay() {
        this.loading = true;
        this.playlists.playQuickList();
        this.loading = false;
    }

    @bind @action public async handleClear() {
        this.playlists.clearQuickList();
    }

    @bind @action public async handleRemoveItem(_, { value }: { value: number }) {
        this.playlists.removeQuickListEntry(value);
    }

    public render() {
        if (!this.visible) { return null; }
        return (
            <div className={css.container}>
                <Menu>
                    <Menu.Item icon="play" color="blue" onClick={this.handlePlay} />
                    <Menu.Item icon="remove" color="red" onClick={this.handleClear} />
                    <Dropdown floating item text="Quicklist">
                        <Dropdown.Menu>
                            {
                                this.playlists.quickList.map((entry, index) => {
                                    return (
                                        <Dropdown.Item
                                            key={index}
                                            content={entry.sound.description}
                                            onClick={this.handleRemoveItem}
                                            value={index}
                                        />
                                    );
                                })
                            }
                        </Dropdown.Menu>
                    </Dropdown>
                </Menu>
            </div>
        );
    }
}
