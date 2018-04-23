import { Column, PrimaryGeneratedColumn, Entity, ManyToOne } from "typeorm";
import { is, scope, specify, uuid } from "hyrest";

import { login, signup, owner } from "../scopes";
import { hash } from "../utils";

import { DatabaseUser } from ".";

@Entity()
export class Setting {
    @PrimaryGeneratedColumn("uuid")
    @scope(owner)
    @is().validate(uuid)
    public id?: string;

    @ManyToOne(() => DatabaseUser, user => user.settings)
    @scope(login, owner) @is() @specify(() => DatabaseUser)
    public user?: DatabaseUser;

    @Column("varchar", { length: 32 })
    @is()
    public setting?: string;

    @Column("text")
    @is()
    public value?: string;
}