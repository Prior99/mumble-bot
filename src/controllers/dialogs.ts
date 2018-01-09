import { body, controller, route, param, is, uuid, ok } from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";

import { Dialog } from "../models";
import { createDialog } from "../scopes";

@controller @component
export class Dialogs {
    @inject private db: Connection;

    @route("GET", "/dialogs")
    public async listDialogs(@param("id") @is().validate(uuid) id: string): Promise<{}> {
        return ok();
    }

    @route("POST", "/dialog/:id/play")
    public async playDialog(@param("id") @is().validate(uuid) id: string): Promise<{}> {
        return ok();
    }

    @route("POST", "/dialog")
    public async createDialog(@body(createDialog) dialog: Dialog): Promise<Dialog> {
        return ok();
    }
}
