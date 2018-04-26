import { Column, PrimaryGeneratedColumn, Entity, ManyToOne } from "typeorm";
import { is, scope, specify, uuid } from "hyrest";

import { world, createRecording } from "../scopes";

import { RecordingLabelRelation } from ".";

/**
 * A label with which the records can be tagged.
 */
@Entity()
export class Label {
    /**
     * Unique id of this record which is used as the mapping to the audio file.
     */
    @PrimaryGeneratedColumn("uuid")
    @scope(world, createRecording) @is().validate(uuid)
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
    @ManyToOne(() => RecordingLabelRelation, recordingLabelRelation => recordingLabelRelation.label)
    @scope(world) @is() @specify(() => RecordingLabelRelation)
    public recordingLabelRelations?: RecordingLabelRelation[];
}
