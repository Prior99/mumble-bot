import {
    PrimaryGeneratedColumn,
    Entity,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";
import { is, scope, DataType, oneOf, specify, required, length, uuid, transform } from "hyrest";
import { world } from "../scopes";
import { Label } from "./label";
import { Recording } from "./recording";
import { Dialog } from "./dialog";

@Entity()
export class DialogPart {
    @PrimaryGeneratedColumn("uuid")
    @scope(world) @is().validate(uuid)
    public id?: string;

    @OneToMany(() => Recording, recording => recording.dialogParts)
    @is() @scope(world)
    public recording?: Recording;

    @OneToMany(() => Dialog, dialog => dialog.parts)
    @is() @scope(world)
    public dialog?: Dialog;
}
