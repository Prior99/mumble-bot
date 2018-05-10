import { observable, computed } from "mobx";
import { bind } from "decko";
import { component, inject, initialize } from "tsdi";
import { Playlists, Playlist } from "../../common";
import { SoundsStore } from "./sounds";

@component
export class PlaylistsStore {
    @inject private playlistsController: Playlists;
    @inject private soundsStore: SoundsStore;

    @observable public playlists = new Map<string, Playlist>();

    @initialize
    protected async initialize() {
        const playlists = await this.playlistsController.listPlaylists();
        await Promise.all(playlists.map(async playlist => {
            playlist.entries = await Promise.all(playlist.entries.map(async entry => {
                entry.sound = await this.soundsStore.byId(entry.sound.id);
                return entry;
            }));
            this.playlists.set(playlist.id, playlist);
        }));
    }

    @computed public get all() {
        return Array.from(this.playlists.values());
    }

    @bind public async byId(id: string) {
        if (this.playlists.has(id)) {
            return this.playlists.get(id);
        }
    }
}
