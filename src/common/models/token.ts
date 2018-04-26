import { Column, PrimaryGeneratedColumn, Entity, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { is, scope, specify, uuid } from "hyrest";
import { login, owner } from "../scopes";
import { User } from ".";

@Entity()
export class Token {
    @PrimaryGeneratedColumn("uuid")
    @scope(owner)
    @is().validate(uuid)
    public id?: string;

    @ManyToOne(() => User, user => user.tokens)
    @scope(login, owner) @is() @specify(() => User)
    public user?: User;

    @CreateDateColumn()
    public created?: Date;

    @UpdateDateColumn()
    public updated?: Date;

    @Column("timestamp with time zone", { nullable: true })
    public deleted?: Date;
}
