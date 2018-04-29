import { Column, PrimaryGeneratedColumn, Entity, ManyToOne, CreateDateColumn, OneToMany } from "typeorm";
import { is, scope, specify, uuid, DataType } from "hyrest";
import { world, createDialog } from "../scopes";
import { DialogPart } from ".";
import { User } from "./";

/**
 * A dialog as represented in the database including all its records.
 * @typedef Dialog
 */
@Entity()
export class Dialog {
    /**
     * Unique id of this dialog.
     */
    @PrimaryGeneratedColumn("uuid")
    @scope(world) @is().validate(uuid)
    public id?: string;

    @ManyToOne(() => User, user => user.dialogs)
    public creator?: User;

    /**
     * The date when this dialog was created.
     */
    @CreateDateColumn()
    @scope(world) @is() @specify(() => Date)
    public created?: Date;

    /**
     * How often this dialog was used.
     */
    @Column("int", { default: 0 })
    @is(DataType.int) @scope(world)
    public used?: number;

    /**
     * All records belonging to this dialog.
     */
    @OneToMany(() => DialogPart, dialogPart => dialogPart.dialog)
    @is() @scope(world, createDialog) @specify(() => DialogPart)
    public parts?: DialogPart[];
}
