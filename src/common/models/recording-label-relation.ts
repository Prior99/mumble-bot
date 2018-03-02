import { PrimaryGeneratedColumn, Entity, OneToMany } from "typeorm";
import { is, scope, uuid } from "hyrest";

import { world, createRecording } from "../scopes";

import { Recording, Label } from ".";

@Entity()
export class RecordingLabelRelation {
    @PrimaryGeneratedColumn("uuid")
    @scope(world) @is().validate(uuid)
    public id?: string;

    @OneToMany(() => Recording, recording => recording.recordingLabelRelations)
    @is() @scope(world)
    public recording?: Recording;

    @OneToMany(() => Label, label => label.recordingLabelRelations)
    @is() @scope(world, createRecording)
    public label?: Label;
}
