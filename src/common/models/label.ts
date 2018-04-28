import { Column, PrimaryGeneratedColumn, Entity, ManyToOne } from "typeorm";
import { is, scope, specify, uuid } from "hyrest";

import { world, createSound } from "../scopes";

import { SoundLabelRelation } from ".";

/**
 * A label with which the records can be tagged.
 */
@Entity()
export class Label {
    /**
     * Unique id of this record which is used as the mapping to the audio file.
     */
    @PrimaryGeneratedColumn("uuid")
    @scope(world, createSound) @is().validate(uuid)
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
    @ManyToOne(() => SoundLabelRelation, soundLabelRelation => soundLabelRelation.label)
    @scope(world) @is() @specify(() => SoundLabelRelation)
    public soundLabelRelations?: SoundLabelRelation[];
}
