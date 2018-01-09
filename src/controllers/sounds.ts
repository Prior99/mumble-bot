import { context, body, controller, route, param, is, uuid, ok } from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";
import { verbose } from "winston";

import { DatabaseSound } from "../models";
import { Context } from "../context";
import { Bot } from "..";

@controller @component
export class Sounds {
    @inject private db: Connection;
    @inject private bot: Bot;

    @route("GET", "/sounds")
    public async listSounds(): Promise<DatabaseSound[]> {
        const sounds = await this.db.getRepository(DatabaseSound).find();
        return ok(sounds);
    }

    @route("POST", "/sound/:id/play")
    public async playSound(@param("id") @is().validate(uuid) id: string, @context ctx?: Context): Promise<{}> {
        const sound = await this.db.getRepository(DatabaseSound).findOneById(id);
        sound.used++;
        await this.db.getRepository(DatabaseSound).save(sound);

        const currentUser = await ctx.currentUser();
        this.bot.playSound(`${this.bot.options.paths.uploaded}/${id}`, {
            type: "sound",
            sound,
            user: currentUser
        });

        verbose(`${currentUser.username} played sound #${id}`);

        return ok();
    }
}
