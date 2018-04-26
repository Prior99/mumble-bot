import { context, body, controller, route, param, is, uuid, ok } from "hyrest";
import mkdirp = require("mkdirp-promise");
import { component, inject } from "tsdi";
import { Connection } from "typeorm";
import { verbose } from "winston";
import { writeFile } from "async-file";

import { AudioOutput } from "../../server";
import { ServerConfig } from "../../config";
import { Sound } from "../models";
import { Context } from "../context";
import { createSound, world } from "../scopes";

export class UploadSound extends Sound {
    @is()
    public data?: string;
}

@controller @component
export class Sounds {
    @inject private db: Connection;
    @inject private audioOutput: AudioOutput;
    @inject private config: ServerConfig;

    private async createSoundDirectory() {
        try {
            await mkdirp(`${this.config.uploadDir}`);
        }
        catch (e) {
            if (e.code !== "EEXIST") { throw e; }
        }
    }

    @route("POST", "/sound").dump(Sound, world)
    public async createSound(
        @body(createSound) sound: UploadSound,
    ): Promise<Sound> {
        await this.createSoundDirectory();

        await this.db.getRepository(Sound).save(sound);

        const { data } = sound;
        await writeFile(`${this.config.uploadDir}/${sound.id}`, Buffer.from(data, "base64"));

        verbose(`Added new sound #${sound.id}`);
        delete sound.data;

        return ok(sound);
    }

    @route("GET", "/sounds")
    public async listSounds(): Promise<Sound[]> {
        const sounds = await this.db.getRepository(Sound).find();
        return ok(sounds);
    }

    @route("POST", "/sound/:id/play")
    public async playSound(@param("id") @is().validate(uuid) id: string, @context ctx?: Context): Promise<{}> {
        const sound = await this.db.getRepository(Sound).findOne(id);
        sound.used++;
        await this.db.getRepository(Sound).save(sound);

        const currentUser = await ctx.currentUser();
        this.audioOutput.playSound(`${this.config.uploadDir}/${id}`, {
            type: "sound",
            sound,
            user: currentUser,
        });

        verbose(`${currentUser.name} played sound #${id}`);

        return ok();
    }
}
