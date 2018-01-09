import { Column, PrimaryGeneratedColumn, Entity } from "typeorm";
import { is, scope, uuid, DataType } from "hyrest";

import { world } from "../scopes";

@Entity()
export class DatabaseSound {
    /**
     * Unique id of this sound.
     */
    @PrimaryGeneratedColumn("uuid")
    @scope(world) @is().validate(uuid)
    public id?: string;

    /**
     * The name of the sound (filename).
     */
    @Column("varchar", { length: 100 })
    @is() @scope(world)
    public name?: string;

    /**
     * How often the sound was already palyed back.
     */
    @Column("int", { default: 0 })
    @is(DataType.int) @scope(world)
    public used?: number;
}
