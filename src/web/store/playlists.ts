import { observable, computed, action } from "mobx";
import { bind } from "decko";
import { component, inject } from "tsdi";
import { Sound, Playlists, Playlist, Queue, QueueItem, PlaylistEntry } from "../../common";
import { SoundsStore } from "./sounds";
import { UsersStore } from "./users";
import { PlaylistsQuery } from "../../common/controllers/playlists";

@component
export class PlaylistsStore {
    @inject private playlistsController: Playlists;
    @inject private soundsStore: SoundsStore;
    @inject private usersStore: UsersStore;
    @inject private queue: Queue;

    @observable public playlists = new Map<string, Playlist>();
    @observable public loading = true;
    @observable public quickList: PlaylistEntry[] = [];

    @bind @action public async query(query: PlaylistsQuery) {
        const result = await this.playlistsController.queryPlaylists(query);
        await Promise.all(result.playlists.map(async playlist => {
            playlist.creator = this.usersStore.byId(playlist.creator.id);
            for (let entry of playlist.entries) {
                entry.sound = await this.soundsStore.byId(entry.sound.id);
            }
        }));
        result.playlists.forEach(playlist => this.playlists.set(playlist.id, playlist));
        return result;
    }

    @computed public get all() {
        return Array.from(this.playlists.values());
    }

    @bind public async byId(id: string) {
        if (this.playlists.has(id)) {
            return this.playlists.get(id);
        }
        const playlist = await this.playlistsController.getPlaylist(id);
        this.playlists.set(id, playlist);
        return playlist;
    }

    @bind @action public async play(playlist: Playlist) {
        await this.queue.enqueue({
            type: "playlist",
            playlist: { id: playlist.id },
        } as QueueItem);
        playlist.used++;
    }

    @bind @action public addQuickEntry(sound: Sound) {
        const { pitch } = this.soundsStore;
        this.quickList.push({
            sound,
            pitch,
        });
    }

    @bind @action public async playQuickList() {
        for (let { sound, pitch } of this.quickList) {
            await this.queue.enqueue({
                type: "sound",
                sound: { id: sound.id },
                pitch,
            } as QueueItem);
        }
    }

    @bind @action public clearQuickList() {
        this.quickList = [];
    }

    @bind @action public removeQuickListEntry(index: number) {
        this.quickList.splice(index, 1);
    }

    @bind @action public async saveQuickList(description: string) {
        const playlist = await this.playlistsController.createPlaylist({
            description,
            entries: this.quickList.map(({ pitch, sound, echo }, position) => ({
                position,
                sound: { id: sound.id },
                pitch,
                echo,
            })),
        } as Playlist);
        this.playlists.set(playlist.id, await this.mapSounds(playlist));
        this.quickList = [];
    }

    private async mapSounds(playlist: Playlist) {
        playlist.entries = await Promise.all(playlist.entries.map(async entry => ({
            ...entry,
            sound: await this.soundsStore.byId(entry.sound.id),
        })));
        return playlist;
    }

    @bind @action public async update(id: string, playlist: Playlist) {
        const newPlaylist =  await this.mapSounds(await this.playlistsController.updatePlaylist(id, playlist));
        this.playlists.set(id, newPlaylist);
    }
}
