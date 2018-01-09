import { Column, PrimaryGeneratedColumn, Entity, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { is, scope, specify, uuid } from "hyrest";

import { login, signup, owner } from "../scopes";
import { hash } from "../utils";

import { DatabaseUser } from ".";

@Entity()
export class Token {
    @PrimaryGeneratedColumn("uuid")
    @scope(owner)
    @is().validate(uuid)
    public id?: string;

    @ManyToOne(() => DatabaseUser, user => user.tokens)
    @scope(login, owner) @is() @specify(() => DatabaseUser)
    public user?: DatabaseUser;

    @CreateDateColumn()
    public created?: Date;

    @UpdateDateColumn()
    public updated?: Date;

    @Column("timestamp with time zone", { nullable: true })
    public deleted?: Date;
}
