import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";
import { is, scope, DataType, oneOf, specify, required, length, uuid, transform } from "hyrest";
import { world, login } from "../scopes";
import { hash } from "../utils";
import { Recording } from "./recording";
import { DialogPart } from "./dialog-part";

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
    public id: number;

    /**
     * The date when this dialog was submitted.
     */
    @CreateDateColumn()
    @scope(world) @specify(() => Date) @is()
    public submitted: Date;

    /**
     * How often this dialog was used.
     */
    @Column("int", { default: 0 })
    @is(DataType.int) @scope(world)
    public used: number;

    /**
     * All records belonging to this dialog.
     */
    @ManyToOne(() => DialogPart, dialogPart => dialogPart.dialog)
    @is() @scope(world) @specify(() => DialogPart)
    public parts: DialogPart[];
}
