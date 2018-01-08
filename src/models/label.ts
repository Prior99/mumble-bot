import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";
import { is, scope, DataType, oneOf, specify, required, length, uuid, transform } from "hyrest";
import { world } from "../scopes";
import { RecordLabeLRelation } from "./record-label-relation";

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
    @ManyToOne(() => RecordLabeLRelation, recordLabelRelation => recordLabelRelation.label)
    @scope(world) @specify(() => RecordLabeLRelation) @is()
    public recordLabelRelations?: RecordLabeLRelation[];
}
