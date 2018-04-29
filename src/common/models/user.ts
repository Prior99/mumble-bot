import { Column, PrimaryGeneratedColumn, Entity, OneToMany } from "typeorm";
import { oneOf, is, scope, specify, length, uuid, transform, only, required } from "hyrest";

import { world, login, owner, signup, createMumbleLink } from "../scopes";
import { hash } from "../utils";

import { Sound, PermissionAssociation, Token, Setting, MumbleLink, Playlist } from ".";

/**
 * A user from the database.
 */
@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    @scope(world, createMumbleLink) @is().validate(uuid)
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
    @scope(owner, login)
    public email?: string;

    @Column("integer", { default: 0 })
    public score?: number;

    @OneToMany(() => Sound, sound => sound.user)
    @is() @scope(world) @specify(() => Sound)
    public sounds?: Sound[];

    @OneToMany(() => Sound, sound => sound.creator)
    @is() @scope(world) @specify(() => Sound)
    public reported?: Sound[];

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
    public mumbleLinks?: MumbleLink[];

    @OneToMany(() => Playlist, playlist => playlist.creator)
    public playlists?: Playlist[];
}


