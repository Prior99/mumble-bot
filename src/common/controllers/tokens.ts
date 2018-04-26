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
import { User, Token } from "../models";
import { Context } from "../context";

@controller @component
export class Tokens {
    @inject public db: Connection;

    @route("POST", "/token").dump(Token, owner) @noauth
    public async createToken(@body(login) credentials: User): Promise<Token> {
        const user = await this.db.getRepository(User).findOne(credentials);
        if (!user) {
            return unauthorized();
        }
        const newToken = await this.db.getRepository(Token).save(populate(owner, Token, { user }));
        return created(newToken);
    }
}
