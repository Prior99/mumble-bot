import { notFound, controller, route, param, is, uuid, ok } from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";
import { ServerConfig } from "../../config";
import { AudioCache } from "../../server";
import { CachedAudio } from "../models";
import { world } from "../scopes";

@controller @component
export class Cached {
    @inject private cache: AudioCache;

    @route("GET", "/cached").dump(CachedAudio, world)
    public async listCached(): Promise<CachedAudio[]> {
        return ok(this.cache.sorted);
    }

    @route("DELETE", "/cached/:id")
    public async deleteCached(@param("id") @is().validate(uuid) id: string): Promise<{}> {
        if (this.cache.remove(id)) {
            return ok();
        }
        return notFound<undefined>(`No cached sound with id "${id}" found.`);
    }
}
