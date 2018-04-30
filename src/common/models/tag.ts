import { Column, PrimaryGeneratedColumn, Entity, OneToMany } from "typeorm";
import { is, scope, specify, uuid } from "hyrest";

import { world, createSound } from "../scopes";

import { SoundTagRelation } from ".";

/**
 * A tag with which the records can be tagged.
 */
@Entity()
export class Tag {
    /**
     * Unique id of this record which is used as the mapping to the audio file.
     */
    @PrimaryGeneratedColumn("uuid")
    @scope(world, createSound) @is().validate(uuid)
    public id?: string;

    /**
     * Name of this tag.
     */
    @Column("varchar", { length: 100 })
    @is() @scope(world)
    public name?: string;

    /**
     * A list of all tags with which this record was tagged.
     */
    @OneToMany(() => SoundTagRelation, soundTagRelation => soundTagRelation.tag)
    @scope(world) @is() @specify(() => SoundTagRelation)
    public soundTagRelations?: SoundTagRelation[];
}
