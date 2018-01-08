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
import { Permission } from "./permission";
import { DatabaseUser } from "./database-user";

@Entity()
export class PermissionAssociation {
    @PrimaryGeneratedColumn("uuid")
    @scope(world) @is().validate(uuid)
    public id?: string;

    @Column("bool", { default: false })
    @is() @scope(world)
    public granted?: boolean;

    @Column("bool", { default: false })
    @is() @scope(world)
    public canGrant?: boolean;

    @OneToMany(() => Permission, permission => permission.associations)
    @is() @scope(world)
    public permission?: Permission;

    @OneToMany(() => DatabaseUser, user => user.permissionAssociations)
    @is() @scope(world)
    public user?: DatabaseUser;
}
