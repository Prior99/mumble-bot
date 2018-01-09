import { PrimaryGeneratedColumn, Entity, OneToMany } from "typeorm";
import { is, scope, uuid } from "hyrest";

import { world } from "../scopes";

import { Dialog, Label, Recording  } from ".";

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