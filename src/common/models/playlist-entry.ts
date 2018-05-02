import { PrimaryGeneratedColumn, Entity, ManyToOne, Column } from "typeorm";
import { is, scope, uuid } from "hyrest";

import { world, createPlaylist } from "../scopes";

import { Playlist, Sound  } from ".";

@Entity()
export class PlaylistEntry {
    @PrimaryGeneratedColumn("uuid")
    @scope(world) @is().validate(uuid)
    public id?: string;

    @ManyToOne(() => Sound, sound => sound.playlistEntrys)
    @is() @scope(world, createPlaylist)
    public sound?: Sound;

    @ManyToOne(() => Playlist, playlist => playlist.entries)
    @is() @scope(world, createPlaylist)
    public playlist?: Playlist;

    @Column("integer")
    @is() @scope(world, createPlaylist)
    public position?: number;
}
