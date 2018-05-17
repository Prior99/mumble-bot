import { PrimaryGeneratedColumn, Entity, ManyToOne, Column } from "typeorm";
import { is, scope, uuid } from "hyrest";

import { world, createPlaylist, listPlaylists } from "../scopes";

import { Playlist, Sound  } from ".";

@Entity()
export class PlaylistEntry {
    @PrimaryGeneratedColumn("uuid")
    @scope(world, listPlaylists) @is().validate(uuid)
    public id?: string;

    @ManyToOne(() => Sound, sound => sound.playlistEntrys)
    @is() @scope(world, createPlaylist, listPlaylists)
    public sound?: Sound;

    @ManyToOne(() => Playlist, playlist => playlist.entries)
    @is() @scope(world)
    public playlist?: Playlist;

    @Column("integer")
    @is() @scope(world, createPlaylist, listPlaylists)
    public position?: number;

    @Column("integer", { default: 0 })
    @is() @scope(world, createPlaylist, listPlaylists)
    public pitch?: number;
}
