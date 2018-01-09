import { inject, external } from "tsdi";
import { Request } from "express";
import { Connection } from "typeorm";

import { Validation } from "./controllers";
import { DatabaseUser } from "./models";

import { getAuthTokenId } from "./utils";

@external
export class Context {
    @inject("validation") public validation: Validation;
    @inject private db: Connection;

    private authTokenId: string;

    constructor(req: Request) {
        const id = getAuthTokenId(req);
        this.authTokenId = id;
    }

    public async currentUser() {
        const id = this.authTokenId;
        if (!id) {
            return;
        }
        return await this.db.getRepository(DatabaseUser).createQueryBuilder("user")
            .innerJoin("user.tokens", "token")
            .where("token.id=:id", { id })
            .getOne();
    }
}
