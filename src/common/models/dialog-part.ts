import { PrimaryGeneratedColumn, Entity, OneToMany } from "typeorm";
import { is, scope, uuid } from "hyrest";

import { world, createDialog } from "../scopes";

import { Dialog, Sound  } from ".";

@Entity()
export class DialogPart {
    @PrimaryGeneratedColumn("uuid")
    @scope(world) @is().validate(uuid)
    public id?: string;

    @OneToMany(() => Sound, sound => sound.dialogParts)
    @is() @scope(world, createDialog)
    public sound?: Sound;

    @OneToMany(() => Dialog, dialog => dialog.parts)
    @is() @scope(world)
    public dialog?: Dialog;
}
