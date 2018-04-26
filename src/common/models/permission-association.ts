import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    OneToMany,
} from "typeorm";
import { is, scope, uuid } from "hyrest";
import { world } from "../scopes";
import { User } from "./user";

@Entity()
export class PermissionAssociation {
    @PrimaryGeneratedColumn("uuid")
    @scope(world) @is().validate(uuid)
    public id?: string;

    @Column("varchar", { length: 32 })
    @is() @scope(world)
    public permission?: string;

    @OneToMany(() => User, user => user.permissionAssociations)
    @is() @scope(world)
    public user?: User;
}
