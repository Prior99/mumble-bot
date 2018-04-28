import { Column, PrimaryGeneratedColumn, Entity, ManyToOne, OneToMany, CreateDateColumn } from "typeorm";
import { oneOf, is, scope, DataType, specify, uuid } from "hyrest";

import { world, createSound } from "../scopes";

import { User, DialogPart, SoundLabelRelation } from ".";

/**
 * A single record as represented in the database.
 */
@Entity()
export class Sound {
    /**
     * Unique id of this record which is used as the mapping to the audio file.
     */
    @PrimaryGeneratedColumn("uuid")
    @scope(world) @is().validate(uuid)
    public id?: string;

    /**
     * The quote for this record (textual description).
     */
    @Column("text")
    @is() @scope(world, createSound)
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
    @is() @scope(world)
    public user?: User;

    @Column("varchar", { length: 16 })
    @is().validate(oneOf("upload", "sound"))
    public source?: "upload" | "sound";

    /**
     * The user who reported the record.
     */
    @ManyToOne(() => User, user => user.reported)
    @is() @scope(world)
    public reporter?: User;

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
    public submitted?: Date;

    /**
     * A list of all labels with which this record was tagged.
     */
    @ManyToOne(() => SoundLabelRelation, soundLabelRelation => soundLabelRelation.sound)
    @scope(world, createSound) @is() @specify(() => SoundLabelRelation)
    public soundLabelRelations?: SoundLabelRelation[];

    /**
     * Duration in seconds of this sound.
     */
    @Column("double precision")
    @scope(world) @is(DataType.float)
    public duration?: number;

    @ManyToOne(() => DialogPart, dialogPart => dialogPart.sound)
    @scope(world) @is() @specify(() => DialogPart)
    public dialogParts?: DialogPart[];
}
