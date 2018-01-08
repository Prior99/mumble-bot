import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";
import { is, scope, DataType, oneOf, specify, required, length, uuid } from "hyrest";
import { world } from "../scopes";
import { PermissionAssociation } from "./permission-association";

/**
 * A single permission as stored in the database.
 */
@Entity()
export class Permission {
    @PrimaryGeneratedColumn("uuid")
    @scope(world) @is().validate(uuid)
    public id?: string;

    /**
     * Human readable name of the permission.
     */
    @Column("varchar", { length: 100 })
    @is() @scope(world)
    public name?: string;

    /**
     * Human readable description of the permission.
     */
    @Column("text")
    @is() @scope(world)
    public description?: string;

    /**
     * Font Awesome icon class of this permission.
     */
    @Column("varchar", { length: 100 })
    @is() @scope(world)
    public icon?: string;

    @ManyToOne(() => PermissionAssociation, association => association.permission)
    @scope(world) @specify(() => PermissionAssociation) @is()
    public associations?: PermissionAssociation[];
}
