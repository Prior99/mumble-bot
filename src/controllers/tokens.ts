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
    forbidden
} from "hyrest";
import { inject, component } from "tsdi";
import { Connection } from "typeorm";

import { login, owner } from "../scopes";
import { DatabaseUser, Token } from "../models";
import { Context } from "..";

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

    @route("POST", "/token/:id/push-endpoint").dump(Token, owner) @noauth
    public async updatePushEndpoint(
        @param("id") @is().validate(uuid) id: string,
        @body() endpoint: string,
        @context ctx?: Context,
    ): Promise<Token> {
        const token = await this.db.getRepository(Token).findOne({
            where: { id },
            relations: ["user"],
        });
        if (!token) {
            return notFound();
        }
        if (token.user.id !== (await ctx.currentUser()).id) {
            return forbidden();
        }
        token.pushEndpoint = endpoint;
        await this.db.getRepository(Token).save(token);
        return created(token);
    }
}

