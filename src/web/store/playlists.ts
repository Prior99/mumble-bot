import { observable, computed, action } from "mobx";
import { bind } from "decko";
import { component, inject, initialize } from "tsdi";
import { Playlists, Playlist, Queue, QueueItem } from "../../common";
import { SoundsStore } from "./sounds";
import { UsersStore } from "./users";

@component
export class PlaylistsStore {
    @inject private playlistsController: Playlists;
    @inject private soundsStore: SoundsStore;
    @inject private usersStore: UsersStore;
    @inject private queue: Queue;

    @observable public playlists = new Map<string, Playlist>();
    @observable public loading = true;

    @initialize
    protected async initialize() {
        const playlists = await this.playlistsController.listPlaylists();
        await Promise.all(playlists.map(async playlist => {
            playlist.creator = await this.usersStore.byId(playlist.creator.id);
            // Needs to be performed sequentially.
            for (let entry of playlist.entries) {
                entry.sound = await this.soundsStore.byId(entry.sound.id);
            }
            this.playlists.set(playlist.id, playlist);
        }));
        this.loading = false;
    }

    @computed public get all() {
        return Array.from(this.playlists.values());
    }

    @bind public async byId(id: string) {
        if (this.playlists.has(id)) {
            return this.playlists.get(id);
        }
    }

    @bind @action public async play(playlist: Playlist) {
        await this.queue.enqueue({
            type: "playlist",
            playlist: { id: playlist.id },
        } as QueueItem);
        playlist.used++;
    }
}
