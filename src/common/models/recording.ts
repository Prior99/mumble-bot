import { Column, PrimaryGeneratedColumn, Entity, ManyToOne, OneToMany, CreateDateColumn } from "typeorm";
import { is, scope, DataType, specify, uuid } from "hyrest";

import { world } from "../scopes";

import { DatabaseUser, DialogPart, RecordLabeLRelation } from ".";

/**
 * A single record as represented in the database.
 */
@Entity()
export class Recording {
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
    @is() @scope(world)
    public quote?: string;

    /**
     * How often this record was already used.
     */
    @Column("int", { default: 0 })
    @is(DataType.int) @scope(world)
    public used?: number;

    /**
     * The user who said this record.
     */
    @ManyToOne(() => DatabaseUser, user => user.recordings)
    @is() @scope(world)
    public user?: DatabaseUser;

    /**
     * The user who reported the record.
     */
    @ManyToOne(() => DatabaseUser, user => user.reported)
    @is() @scope(world)
    public reporter?: DatabaseUser;

    /**
     * Whether this forked record overwrites the original one.
     */
    @Column("bool", { default: false })
    @is() @scope(world)
    public overwrite?: boolean;

    /**
     * Id of the record this record is forked from or null if its an original one.
     */
    @ManyToOne(() => Recording, recording => recording.children)
    @is() @scope(world)
    public parent?: Recording;

    @OneToMany(() => Recording, recording => recording.parent)
    @is() @scope(world) @specify(() => Recording)
    public children?: Recording[];

    /**
     * When the record was originally recorded.
     */
    @CreateDateColumn()
    @scope(world) @specify(() => Date) @is()
    public submitted?: Date;

    /**
     * A list of all labels with which this record was tagged.
     */
    @ManyToOne(() => RecordLabeLRelation, recordingLabelRelation => recordingLabelRelation.recording)
    @scope(world) @specify(() => RecordLabeLRelation) @is()
    public recordingLabelRelations?: RecordLabeLRelation[];

    /**
     * Duration in seconds of this recording.
     */
    @Column("float")
    @scope(world) @is(DataType.float)
    public duration?: number;

    @ManyToOne(() => DialogPart, dialogPart => dialogPart.recording)
    @scope(world) @specify(() => DialogPart) @is()
    public dialogParts?: DialogPart[];
}
