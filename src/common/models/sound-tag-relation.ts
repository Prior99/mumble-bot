import { PrimaryGeneratedColumn, Entity, ManyToOne } from "typeorm";
import { is, scope, uuid } from "hyrest";

import { world, createSound } from "../scopes";

import { Sound, Tag } from ".";

@Entity()
export class SoundTagRelation {
    @PrimaryGeneratedColumn("uuid")
    @scope(world) @is().validate(uuid)
    public id?: string;

    @ManyToOne(() => Sound, sound => sound.soundTagRelations)
    @is() @scope(world)
    public sound?: Sound;

    @ManyToOne(() => Tag, tag => tag.soundTagRelations)
    @is() @scope(world, createSound)
    public tag?: Tag;
}
