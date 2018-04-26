import { PrimaryGeneratedColumn, Entity, OneToMany } from "typeorm";
import { is, scope, uuid } from "hyrest";

import { world, createDialog } from "../scopes";

import { Dialog, Recording  } from ".";

@Entity()
export class DialogPart {
    @PrimaryGeneratedColumn("uuid")
    @scope(world) @is().validate(uuid)
    public id?: string;

    @OneToMany(() => Recording, recording => recording.dialogParts)
    @is() @scope(world, createDialog)
    public recording?: Recording;

    @OneToMany(() => Dialog, dialog => dialog.parts)
    @is() @scope(world)
    public dialog?: Dialog;
}
