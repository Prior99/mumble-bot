import { context, body, controller, route, param, is, uuid, ok, notFound, created } from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";
import { verbose } from "winston";

import { DatabaseUser, Permission, PermissionAssociation } from "../models";
import { createUser, world } from "../scopes";
import { Context } from "../context";

@controller @component
export class Users {
    @inject private db: Connection;

    @route("GET", "/user/:id/permissions")
    public async listPermissionsForUser(@param("id") @is().validate(uuid) id: string): Promise<string[]> {
        const associations = await this.db.getRepository(PermissionAssociation).createQueryBuilder("association")
            .leftJoin("user", "user")
            .where("user.id = :id", { id })
            .getMany();
        return ok(associations.map(association => association.id));
    }

    @route("DELETE", "/user/:id/permission/:permission")
    public async revokePermission(
        @param("id") @is().validate(uuid) id: string,
        @param("permission") @is() permission: string,
        @context ctx?: Context
    ): Promise<{}> {
        const associations = await this.db.getRepository(PermissionAssociation).createQueryBuilder("association")
            .leftJoin("user", "user")
            .where("user.id = :id AND association.permission = :permission", { id, permission })
            .delete();

        const user = await this.db.getRepository(DatabaseUser).findOneById(id);
        const currentUser = await ctx.currentUser();
        verbose(`Permission "${permission}" revoked from ${user.username} by ${currentUser.username}`);

        return ok();
    }

    @route("POST", "/user/:id/permission")
    public async grantPermission(
        @param("id") @is().validate(uuid) id: string,
        @param("permission") @is() permission: string,
        @context ctx?: Context
    ): Promise<DatabaseUser> {
        const association = { permission, user: { id }};
        await this.db.getRepository(PermissionAssociation).save(association);

        const user = await this.db.getRepository(DatabaseUser).findOneById(id);
        const currentUser = await ctx.currentUser();
        verbose(`Permission "${permission}" granted to ${user.username} by ${currentUser.username}`);

        return created(user);
    }
}
