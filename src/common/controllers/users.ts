import { context, body, controller, route, param, is, uuid, ok, notFound, created, DataType, noauth } from "hyrest";
import { component, inject } from "tsdi";
import { Connection, Transaction, EntityManager, TransactionManager } from "typeorm";
import { verbose } from "winston";

import { DatabaseUser, PermissionAssociation } from "../models";
import { signup, world, owner } from "../scopes";
import { Context } from "../context";
import { Setting } from "../models/setting";

export interface Settings {
    [key: string]: string;
}

@controller @component
export class Users {
    @inject private db: Connection;

    /**
     * List all users from the database with their public data.
     *
     * @return A list of all users.
     */
    @route("GET", "/users").dump(DatabaseUser, world)
    public async listUsers(): Promise<DatabaseUser[]> {
        return ok(await this.db.getRepository(DatabaseUser).find());
    }

    /**
     * Fetch one specific user by id.
     *
     * @param id The id of the user to fetch.
     *
     * @return The specified user.
     */
    @route("GET", "/user/:id").dump(DatabaseUser, world)
    public async getUser(@param("id") @is().validate(uuid) id: string): Promise<DatabaseUser> {
        const user = await this.db.getRepository(DatabaseUser).findOne(id);
        if (!user) { return notFound<DatabaseUser>(`No user with id "${id}"`); }
        return ok(user);
    }

    /**
     * Signup a new user.
     *
     * @param user `name`, `email` and `password` of the new user to create.
     *
     * @return The created user.
     */
    @route("POST", "/user").dump(DatabaseUser, owner) @noauth
    public async createUser(@body(signup) user: DatabaseUser): Promise<DatabaseUser> {
        await this.db.getRepository(DatabaseUser).save(user);
        verbose(`New user ${user.name} with id ${user.id} just signed up`);
        return created(user);
    }

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
        @context ctx?: Context,
    ): Promise<{}> {
        const associations = await this.db.getRepository(PermissionAssociation).createQueryBuilder("association")
            .leftJoin("user", "user")
            .where("user.id = :id AND association.permission = :permission", { id, permission })
            .delete()
            .execute();

        const user = await this.db.getRepository(DatabaseUser).findOne(id);
        const currentUser = await ctx.currentUser();
        verbose(`Permission "${permission}" revoked from ${user.name} by ${currentUser.name}`);

        return ok();
    }

    @route("POST", "/user/:id/permission")
    public async grantPermission(
        @param("id") @is().validate(uuid) id: string,
        @param("permission") @is() permission: string,
        @context ctx?: Context,
    ): Promise<DatabaseUser> {
        const association = { permission, user: { id }};
        await this.db.getRepository(PermissionAssociation).save(association);

        const user = await this.db.getRepository(DatabaseUser).findOne(id);
        const currentUser = await ctx.currentUser();
        verbose(`Permission "${permission}" granted to ${user.name} by ${currentUser.name}`);

        return created(user);
    }

    @route("GET", "/user/:id/settings")
    public async getSettings(@param("id") @is().validate(uuid) id: string): Promise<Settings> {
        const settings = await this.db.getRepository(Setting).createQueryBuilder("setting")
            .leftJoin("user", "user")
            .where("user.id = :id", { id })
            .getMany();
        const map = settings.reduce((result, setting) => {
            result[setting.setting] = setting.value;
            return result;
        }, {} as Settings);
        return ok(map);
    }

    @route("POST", "/user/:id/settings") @Transaction()
    public async updateSettings(
        @param("id") @is().validate(uuid) id: string,
        @body() @is(DataType.obj) settings: Settings,
        @TransactionManager() transaction?: EntityManager,
    ): Promise<Settings> {
        const old = await transaction.getRepository(Setting).createQueryBuilder("setting")
            .leftJoin("user", "user")
            .where("user.id = :id", { id })
            .getMany();
        await Promise.all(old.map(async oldSetting => {
            const newValue = settings[oldSetting.setting];
            if (newValue !== oldSetting.value) {
                oldSetting.value = newValue;
                await transaction.getRepository(Setting).save(oldSetting);
            }
        }));
        return ok(settings);
    }
}
