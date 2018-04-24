import { Column, PrimaryGeneratedColumn, Entity, OneToMany } from "typeorm";
import { is, scope, specify, length, uuid, transform, only, required } from "hyrest";

import { world, login, owner, signup } from "../scopes";
import { hash } from "../utils";

import { Recording, PermissionAssociation, Token, Setting, MumbleLink } from ".";

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
    @is()
        .validate(length(3, 100), only(signup, required))
        .validateCtx(ctx => only(signup, value => ctx.validation.nameAvailable(value)))
    @scope(world, signup)
    public name?: string;

    /**
     * The password of the user.
     */
    @Column("varchar", { length: 200 })
    @transform(hash)
    @is().validate(length(8, 255)) @scope(login)
    public password?: string;

    @Column("varchar", { length: 200 })
    @is()
        .validate(length(8, 200), required)
        .validateCtx(ctx => only(signup, value => ctx.validation.emailAvailable(value)))
    @scope(login)
    public email?: string;

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

    @OneToMany(() => MumbleLink, mumbleLink => mumbleLink.user)
    @is() @specify(() => MumbleLink)
    public mumbleLinks?: MumbleLink;
}
