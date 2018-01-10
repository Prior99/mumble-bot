import { Column, PrimaryGeneratedColumn, Entity, OneToMany } from "typeorm";
import { is, scope, specify, length, uuid, transform } from "hyrest";

import { world, login, owner } from "../scopes";
import { hash } from "../utils";

import { Recording, PermissionAssociation, Token, Setting } from ".";

/**
 * A user from the database.
 */
@Entity()
export class DatabaseUser {
    @PrimaryGeneratedColumn("uuid")
    @scope(world) @is().validate(uuid)
    public id?: string;

    /**
     * The username of this user.
     */
    @Column("varchar", { length: 100 })
    @is() @scope(world)
    public username?: string;

    /**
     * The password of the user.
     */
    @Column("varchar", { length: 200 })
    @is().validate(length(8, 255)) @scope(login)
    @transform(hash)
    public password?: string;

    @OneToMany(() => Recording, recording => recording.user)
    @is() @scope(world) @specify(() => Recording)
    public recordings?: Recording[];

    @OneToMany(() => Recording, recording => recording.reporter)
    @is() @scope(world) @specify(() => Recording)
    public reported?: Recording[];

    @OneToMany(() => PermissionAssociation, permissionAssociation => permissionAssociation.user)
    @is() @scope(world) @specify(() => PermissionAssociation)
    public permissionAssociations?: PermissionAssociation[];

    @OneToMany(() => Token, token => token.user)
    @is() @specify(() => Token)
    @scope(owner)
    public tokens?: Token[];

    /**
     * The custom settings of the user are stored key-value-wise in this object.
     */
    @OneToMany(() => Setting, setting => setting.user)
    @is() @specify(() => Setting)
    @scope(owner)
    public settings?: Setting[];
}
