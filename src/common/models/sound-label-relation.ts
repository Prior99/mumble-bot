import { PrimaryGeneratedColumn, Entity, ManyToOne } from "typeorm";
import { is, scope, uuid } from "hyrest";

import { world, createSound } from "../scopes";

import { Sound, Label } from ".";

@Entity()
export class SoundLabelRelation {
    @PrimaryGeneratedColumn("uuid")
    @scope(world) @is().validate(uuid)
    public id?: string;

    @ManyToOne(() => Sound, sound => sound.soundLabelRelations)
    @is() @scope(world)
    public sound?: Sound;

    @ManyToOne(() => Label, label => label.soundLabelRelations)
    @is() @scope(world, createSound)
    public label?: Label;
}
