import { body, controller, route, param, is, uuid, ok } from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";

import { Label } from "../models";
import { createLabel } from "../scopes";

@controller @component
export class Labels {
    @inject private db: Connection;

    @route("GET", "/labels")
    public async listLabels(): Promise<Label[]> {
        return ok([]);
    }

    @route("POST", "/labels")
    public async createLabel(@body(createLabel) label: Label): Promise<Label> {
        return ok();
    }
}
