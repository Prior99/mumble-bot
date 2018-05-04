import mkdirp = require("mkdirp-promise");
import { rename } from "fs-extra";
import { context, notFound, body, controller, route, param, is, uuid, ok } from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";
import { verbose } from "winston";
import { ServerConfig } from "../../config";
import { AudioCache } from "../../server";
import { CachedAudio, Sound } from "../models";
import { createSound, world } from "../scopes";
import { Context } from "../context";

@controller @component
export class Cached {
    @inject private db: Connection;
    @inject private config: ServerConfig;
    @inject private cache: AudioCache;

    @route("GET", "/cached").dump(CachedAudio, world)
    public async listCached(): Promise<CachedAudio[]> {
        return ok(this.cache.sorted);
    }

    private async createSoundDirectory() {
        try {
            await mkdirp(this.config.soundsDir);
        }
        catch (e) {
            if (e.code !== "EEXIST") { throw e; }
        }
    }

    @route("POST", "/cached/:id/save").dump(Sound, world)
    public async saveCached(
        @param("id") @is().validate(uuid) id: string,
        @body(createSound) sound: Sound,
        @context ctx?: Context,
    ): Promise<Sound> {
        const cached = this.cache.byId(id);
        if (!cached) {
            return notFound<undefined>(`No cached sound with id "${id}" found.`);
        }

        const currentUser = await ctx.currentUser();
        sound.creator = currentUser;
        sound.user = cached.user;

        await this.createSoundDirectory();

        await this.db.getRepository(Sound).save(sound);

        await rename(`${this.config.tmpDir}/${cached.id}`, `${this.config.soundsDir}/${sound.id}`);
        await rename(`${this.config.tmpDir}/${cached.id}.png`, `${this.config.soundsDir}/${sound.id}.png`);

        this.cache.remove(cached.id);
        verbose(`${currentUser.name} added new record #${sound.id}`);

        return ok();
    }

    @route("POST", "/cached/:id/protect").dump(CachedAudio, world)
    public async protectCached(@param("id") @is().validate(uuid) id: string): Promise<CachedAudio> {
        if (this.cache.protect(id)) {
            return ok();
        }
        return notFound<undefined>(`No cached sound with id "${id}" found.`);
    }

    @route("DELETE", "/cached/:id")
    public async deleteCached(@param("id") @is().validate(uuid) id: string): Promise<{}> {
        if (this.cache.remove(id)) {
            return ok();
        }
        return notFound<undefined>(`No cached sound with id "${id}" found.`);
    }
}
