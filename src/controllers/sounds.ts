import { body, controller, route, param, is, uuid, ok } from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";

import { DatabaseSound } from "../models";

@controller @component
export class Sounds {
    @inject private db: Connection;

    @route("GET", "/sounds")
    public async listSounds(): Promise<DatabaseSound[]> {
        return ok([]);
    }

    @route("POST", "/sound/:id/play")
    public async saveCached(@param("id") @is().validate(uuid) id: string): Promise<{}> {
        return ok();
    }
}
