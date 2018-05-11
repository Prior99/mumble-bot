import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { oneOf, is, scope, DataType, specify, uuid } from "hyrest";

import { live, world, createSound, updateSound, enqueue, listPlaylists } from "../scopes";

import { User, PlaylistEntry, SoundTagRelation } from ".";

/**
 * A single record as represented in the database.
 */
@Entity()
export class Sound {
    /**
     * Unique id of this record which is used as the mapping to the audio file.
     */
    @PrimaryGeneratedColumn("uuid")
    @scope(world, enqueue, live, listPlaylists) @is().validate(uuid)
    public id?: string;

    /**
     * The quote for this record (textual description).
     */
    @Column("text")
    @is() @scope(world, createSound, updateSound)
    public description?: string;

    /**
     * How often this record was already used.
     */
    @Column("int", { default: 0 })
    @is(DataType.int) @scope(world)
    public used?: number;

    /**
     * The user who said this record.
     */
    @ManyToOne(() => User, user => user.sounds, { nullable: true })
    @is() @scope(world) @specify(() => User)
    public user?: User;

    @Column("varchar", { length: 16 })
    @is().validate(oneOf("upload", "sound", "youtube")) @scope(world)
    public source?: "upload" | "recording" | "youtube";

    /**
     * The user who reported the record.
     */
    @ManyToOne(() => User, user => user.reported)
    @is() @scope(world) @specify(() => User)
    public creator?: User;

    /**
     * Whether this forked record overwrites the original one.
     */
    @Column("bool", { default: false })
    @is() @scope(world)
    public overwrite?: boolean;

    /**
     * Id of the record this record is forked from or null if its an original one.
     */
    @ManyToOne(() => Sound, sound => sound.children, { nullable: true })
    @is() @scope(world)
    public parent?: Sound;

    @OneToMany(() => Sound, sound => sound.parent)
    @is() @scope(world) @specify(() => Sound)
    public children?: Sound[];

    /**
     * When the record was originally recorded.
     */
    @CreateDateColumn()
    @scope(world) @is() @specify(() => Date)
    public created?: Date;

    @UpdateDateColumn()
    @scope(world) @is() @specify(() => Date)
    public updated?: Date;

    /**
     * A list of all labels with which this record was tagged.
     */
    @OneToMany(() => SoundTagRelation, soundTagRelation => soundTagRelation.sound)
    @scope(world, createSound) @is() @specify(() => SoundTagRelation)
    public soundTagRelations?: SoundTagRelation[];

    /**
     * Duration in seconds of this sound.
     */
    @Column("double precision")
    @scope(world) @is(DataType.float)
    public duration?: number;

    @OneToMany(() => PlaylistEntry, playlistEntry => playlistEntry.sound)
    @scope(world) @is() @specify(() => PlaylistEntry)
    public playlistEntrys?: PlaylistEntry[];
}
