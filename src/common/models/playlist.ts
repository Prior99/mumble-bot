import { Column, PrimaryGeneratedColumn, Entity, ManyToOne, CreateDateColumn, OneToMany } from "typeorm";
import { is, scope, specify, uuid, DataType } from "hyrest";
import { world, createPlaylist, enqueue, live, listPlaylists, updatePlaylist } from "../scopes";
import { PlaylistEntry } from "./playlist-entry";
import { User } from "./";

/**
 * A playlist as represented in the database including all its records.
 * @typedef Playlist
 */
@Entity()
export class Playlist {
    /**
     * Unique id of this playlist.
     */
    @PrimaryGeneratedColumn("uuid")
    @scope(world, enqueue, live, listPlaylists) @is().validate(uuid)
    public id?: string;

    @ManyToOne(() => User, user => user.playlists) @scope(listPlaylists, world)
    public creator?: User;

    /**
     * The date when this playlist was created.
     */
    @CreateDateColumn()
    @scope(world, listPlaylists) @is() @specify(() => Date)
    public created?: Date;

    @Column("text")
    @scope(world, createPlaylist, listPlaylists, updatePlaylist) @is()
    public description?: string;

    /**
     * How often this playlist was used.
     */
    @Column("int", { default: 0 })
    @is(DataType.int) @scope(world, listPlaylists)
    public used?: number;

    /**
     * All records belonging to this playlist.
     */
    @OneToMany(() => PlaylistEntry, playlistEntry => playlistEntry.playlist)
    @is() @scope(world, createPlaylist, listPlaylists) @specify(() => PlaylistEntry)
    public entries?: PlaylistEntry[];

    public get duration() {
        return this.entries.reduce((result, entry) => entry.sound.duration + result, 0);
    }
}
