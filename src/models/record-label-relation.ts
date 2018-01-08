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
import { Label } from "./label";
import { Recording } from "./recording";

@Entity()
export class RecordLabeLRelation {
    @PrimaryGeneratedColumn("uuid")
    @scope(world) @is().validate(uuid)
    public id?: string;

    @OneToMany(() => Recording, recording => recording.recordLabelRelations)
    @is() @scope(world)
    public recording?: Recording;

    @OneToMany(() => Label, label => label.recordLabelRelations)
    @is() @scope(world)
    public label?: Label;
}
