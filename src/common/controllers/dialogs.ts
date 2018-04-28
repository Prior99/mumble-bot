import { context, body, controller, route, param, is, uuid, ok, created } from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";
import { verbose } from "winston";

import { AudioOutput } from "../../server";
import { ServerConfig } from "../../config";
import { Dialog } from "../models";
import { createDialog, world } from "../scopes";
import { Context } from "../context";

@controller @component
export class Dialogs {
    @inject private db: Connection;
    @inject private audioOutput: AudioOutput;
    @inject private config: ServerConfig;

    @route("GET", "/dialogs").dump(Dialog, world)
    public async listDialogs(@param("id") @is().validate(uuid) id: string): Promise<Dialog[]> {
        const dialogs = await this.db.getRepository(Dialog).find();
        return ok(dialogs);
    }

    @route("POST", "/dialog/:id/play")
    public async playDialog(@param("id") @is().validate(uuid) id: string, @context ctx?: Context): Promise<{}> {
        const dialog = await this.db.getRepository(Dialog).findOne(id, {
            relations: ["parts", "parts.sound"],
        });
        dialog.used++;
        await this.db.getRepository(Dialog).save(dialog);

        const currentUser = await ctx.currentUser();

        const files = dialog.parts.map(part => `${this.config.soundsDir}/${part.sound.id}`);
        this.audioOutput.playSounds(files, {
            type: "dialog",
            user: currentUser,
        });

        verbose(`${currentUser.name} played dialog ${id}`);

        return ok();
    }

    @route("POST", "/dialog").dump(Dialog, world)
    public async createDialog(@body(createDialog) dialog: Dialog, @context ctx?: Context): Promise<Dialog> {
        await this.db.getRepository(Dialog).save(dialog);

        const { name } = await ctx.currentUser();
        verbose(`${name} created a new dialog ${dialog.id}`);

        return created(dialog);
    }
}
