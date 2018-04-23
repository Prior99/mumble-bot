import { inject, external } from "tsdi";
import { Request } from "express";
import { Connection } from "typeorm";

import { Validation } from "./controllers";
import { DatabaseUser, PermissionAssociation } from "./models";

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

    /**
     * Checks whether a user has the given permission.
     * @param user - User to check the permission of.
     * @param permission - Permission to check.
     * @returns {boolean} - Whether the permission was granted or whether not.
     */
    public async hasPermission(userId: string, permission: string) {
        const associations = await this.db.getRepository(PermissionAssociation).createQueryBuilder("association")
            .leftJoin("user", "user")
            .where("user.id = :userId AND association.permission = :permission", { userId, permission })
            .getCount();
        return associations > 0;
    }
}
