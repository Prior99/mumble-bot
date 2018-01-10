import { context, body, controller, route, param, is, uuid, ok } from "hyrest";
import mkdirp = require("mkdirp-promise"); // tslint:disable-line
import { component, inject } from "tsdi";
import { Connection } from "typeorm";
import { verbose } from "winston";
import { writeFile } from "async-file";

import { DatabaseSound } from "../models";
import { Context } from "../context";
import { createSound, world } from "../scopes";
import { Bot } from "..";

export class UploadSound extends DatabaseSound {
    @is()
    public data?: string;
}

@controller @component
export class Sounds {
    @inject private db: Connection;
    @inject private bot: Bot;

    private async createSoundDirectory() {
        try {
            await mkdirp(`${this.bot.options.paths.uploaded}`);
        }
        catch (e) {
            if (e.code !== "EEXIST") { throw e; }
        }
    }

    @route("POST", "/sound").dump(DatabaseSound, world)
    public async createSound(
        @body(createSound) sound: UploadSound
    ): Promise<DatabaseSound> {
        await this.createSoundDirectory();

        await this.db.getRepository(DatabaseSound).save(sound);

        const { data } = sound;
        await writeFile(`${this.bot.options.paths.uploaded}/${sound.id}`, Buffer.from(data, "base64"));

        verbose(`Added new sound #${sound.id}`);
        delete sound.data;

        return ok(sound);
    }

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
