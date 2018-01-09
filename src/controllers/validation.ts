import { controller, route, is, ok, body, DataType, noauth } from "hyrest";
import { inject, component } from "tsdi";
import { Connection } from "typeorm";

import { DatabaseUser } from "../models";

@controller @component("validation")
export class Validation {
    @inject public db: Connection;
    @route("POST", "/validate/user/username") @noauth
    public async usernameAvailable(@body() @is(DataType.str) username: string) {
        const user = await this.db.getRepository(DatabaseUser).findOne({ username });
        if (user) {
            return ok({ error: "Name already taken." });
        }
        return ok({});
    }
}
