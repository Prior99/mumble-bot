import { controller, route, is, ok, body, DataType, noauth } from "hyrest";
import { inject, component } from "tsdi";
import { Connection } from "typeorm";

import { User } from "../models";

@controller @component("validation")
export class Validation {
    @inject public db: Connection;
    @route("POST", "/validate/user/name") @noauth
    public async nameAvailable(@body() @is(DataType.str) name: string) {
        const user = await this.db.getRepository(User).findOne({ name });
        if (user) {
            return ok({ error: "Name already taken." });
        }
        return ok({});
    }

    @route("POST", "/validate/user/email") @noauth
    public async emailAvailable(@body() @is(DataType.str) email: string) {
        const user = await this.db.getRepository(User).findOne({ email });
        if (user) {
            return ok({ error: "Email already taken." });
        }
        return ok({});
    }
}
