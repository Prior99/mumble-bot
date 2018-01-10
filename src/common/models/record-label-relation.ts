import { PrimaryGeneratedColumn, Entity, OneToMany } from "typeorm";
import { is, scope, uuid } from "hyrest";

import { world } from "../scopes";

import { Recording, Label } from ".";

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
