import { PrimaryGeneratedColumn, Entity, OneToMany } from "typeorm";
import { is, scope, uuid } from "hyrest";

import { world, createPlaylist } from "../scopes";

import { Playlist, Sound  } from ".";

@Entity()
export class PlaylistEntry {
    @PrimaryGeneratedColumn("uuid")
    @scope(world) @is().validate(uuid)
    public id?: string;

    @OneToMany(() => Sound, sound => sound.playlistEntrys)
    @is() @scope(world, createPlaylist)
    public sound?: Sound;

    @OneToMany(() => Playlist, playlist => playlist.parts)
    @is() @scope(world)
    public playlist?: Playlist;
}


