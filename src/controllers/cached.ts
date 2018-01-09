import { body, controller, route, param, is, uuid, ok } from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";

import { CachedAudio } from "../models";
import { createDialog } from "../scopes";

@controller @component
export class Cached {
    @inject private db: Connection;

    @route("GET", "/cached")
    public async listCached(): Promise<CachedAudio[]> {
        return ok([]);
    }

    @route("POST", "/cached/:id/save")
    public async saveCached(@param("id") @is().validate(uuid) id: string): Promise<CachedAudio> {
        return ok();
    }

    @route("POST", "/cached/:id/protect")
    public async protectCached(@param("id") @is().validate(uuid) id: string): Promise<CachedAudio> {
        return ok();
    }

    @route("POST", "/cached/:id/play")
    public async playCached(@param("id") @is().validate(uuid) id: string): Promise<CachedAudio> {
        return ok();
    }

    @route("DELETE", "/cached/:id")
    public async deleteCached(@param("id") @is().validate(uuid) id: string): Promise<CachedAudio> {
        return ok();
    }
}
