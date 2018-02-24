import { body, controller, route, param, is, uuid, ok, notFound, created } from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";
import { verbose } from "winston";

import { DatabaseUser, MumbleDatabaseUser } from "../models";
import { createUser, world } from "../scopes";

@controller @component
export class Users {
    @inject private db: Connection;

    @route("GET", "/users").dump(DatabaseUser, world)
    public async listUsers(): Promise<DatabaseUser[]> {
        return ok(await this.db.getRepository(DatabaseUser).find());
    }

    @route("GET", "/user/:id").dump(DatabaseUser, world)
    public async getUser(@param("id") @is().validate(uuid) id: string): Promise<DatabaseUser> {
        const user = await this.db.getRepository(DatabaseUser).findOneById(id);
        if (!user) { return notFound<DatabaseUser>(`No user with id "${id}"`); }
        return ok(user);
    }

    @route("POST", "/user")
    public async createUser(@body(createUser) user: DatabaseUser): Promise<DatabaseUser> {
        await this.db.getRepository(DatabaseUser).save(user);
        verbose(`New user ${user.username} with id ${user.id} just signed up`);
        return created(user);
    }

    @route("GET", "/user/:id/linked")
    public async getLinkedMumbleUsers(@param("id") @is().validate(uuid) id: string): Promise<MumbleDatabaseUser[]> {
        await this.db.getRepository(MumbleDatabaseUser).;
        return created(user);
    }
}
