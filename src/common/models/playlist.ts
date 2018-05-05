import { Column, PrimaryGeneratedColumn, Entity, ManyToOne, CreateDateColumn, OneToMany } from "typeorm";
import { is, scope, specify, uuid, DataType } from "hyrest";
import { world, createPlaylist, enqueue, live } from "../scopes";
import { PlaylistEntry } from ".";
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
    @scope(world, enqueue, live) @is().validate(uuid)
    public id?: string;

    @ManyToOne(() => User, user => user.playlists)
    public creator?: User;

    /**
     * The date when this playlist was created.
     */
    @CreateDateColumn()
    @scope(world) @is() @specify(() => Date)
    public created?: Date;

    @Column("text")
    @scope(world, createPlaylist) @is()
    public name?: string;

    /**
     * How often this playlist was used.
     */
    @Column("int", { default: 0 })
    @is(DataType.int) @scope(world)
    public used?: number;

    /**
     * All records belonging to this playlist.
     */
    @OneToMany(() => PlaylistEntry, playlistEntry => playlistEntry.playlist)
    @is() @scope(world, createPlaylist) @specify(() => PlaylistEntry)
    public entries?: PlaylistEntry[];
}
