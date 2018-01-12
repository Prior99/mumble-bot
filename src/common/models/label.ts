import { Column, PrimaryGeneratedColumn, Entity, ManyToOne, CreateDateColumn } from "typeorm";
import { is, scope, DataType, specify, uuid } from "hyrest";

import { world } from "../scopes";

import { RecordLabeLRelation } from ".";

/**
 * A label with which the records can be tagged.
 */
@Entity()
export class Label {
    /**
     * Unique id of this record which is used as the mapping to the audio file.
     */
    @PrimaryGeneratedColumn("uuid")
    @scope(world) @is().validate(uuid)
    public id?: string;

    /**
     * Name of this label.
     */
    @Column("varchar", { length: 100 })
    @is() @scope(world)
    public name?: string;

    /**
     * A list of all labels with which this record was tagged.
     */
    @ManyToOne(() => RecordLabeLRelation, recordingLabelRelation => recordingLabelRelation.label)
    @scope(world) @is() @specify(() => RecordLabeLRelation)
    public recordingLabelRelations?: RecordLabeLRelation[];
}
