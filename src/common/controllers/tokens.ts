import {
    controller,
    route,
    created,
    body,
    unauthorized,
    populate,
    noauth,
    context,
    param,
    uuid,
    is,
    notFound,
    forbidden,
} from "hyrest";
import { inject, component } from "tsdi";
import { Connection } from "typeorm";

import { login, owner } from "../scopes";
import { DatabaseUser, Token } from "../models";
import { Context } from "../context";

@controller @component
export class Tokens {
    @inject public db: Connection;

    @route("POST", "/token").dump(Token, owner) @noauth
    public async createToken(@body(login) credentials: DatabaseUser): Promise<Token> {
        const user = await this.db.getRepository(DatabaseUser).findOne(credentials);
        if (!user) {
            return unauthorized();
        }
        const newToken = await this.db.getRepository(Token).save(populate(owner, Token, { user }));
        return created(newToken);
    }
}
