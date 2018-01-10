import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";
import { is, scope, uuid } from "hyrest";
import { world } from "../scopes";
import { Permission } from "./permission";
import { DatabaseUser } from "./database-user";

@Entity()
export class PermissionAssociation {
    @PrimaryGeneratedColumn("uuid")
    @scope(world) @is().validate(uuid)
    public id?: string;

    @Column("varchar", { length: 32 })
    @is() @scope(world)
    public permission?: string;

    @OneToMany(() => DatabaseUser, user => user.permissionAssociations)
    @is() @scope(world)
    public user?: DatabaseUser;
}
