import { context, body, controller, route, param, is, uuid, ok, created } from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";
import { verbose } from "winston";

import { Dialog } from "../models";
import { createDialog } from "../scopes";
import { Bot } from "..";
import { Context } from "../context";

@controller @component
export class Dialogs {
    @inject private db: Connection;
    @inject private bot: Bot;

    @route("GET", "/dialogs")
    public async listDialogs(@param("id") @is().validate(uuid) id: string): Promise<Dialog[]> {
        const dialogs = await this.db.getRepository(Dialog).find();
        return ok(dialogs);
    }

    @route("POST", "/dialog/:id/play")
    public async playDialog(@param("id") @is().validate(uuid) id: string, @context ctx?: Context): Promise<{}> {
        const dialog = await this.db.getRepository(Dialog).findOneById(id, {
            relations: ["parts", "parts.recording"]
        });
        dialog.used++;
        await this.db.getRepository(Dialog).save(dialog);

        const currentUser = await ctx.currentUser();

        const files = dialog.parts.map(part => `${this.bot.options.paths.recordings}/${part.recording.id}`);
        this.bot.output.playSounds(files, {
            type: "dialog",
            user: currentUser
        });

        verbose(`${currentUser.username} played dialog ${id}`);

        return ok();
    }

    @route("POST", "/dialog")
    public async createDialog(@body(createDialog) dialog: Dialog, @context ctx?: Context): Promise<Dialog> {
        await this.db.getRepository(Dialog).save(dialog);

        const { username } = await ctx.currentUser();
        verbose(`${username} created a new dialog ${dialog.id}`);

        return created(dialog);
    }
}
