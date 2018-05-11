import {
    forbidden,
    context,
    body,
    controller,
    route,
    param,
    is,
    uuid,
    ok,
    notFound,
    created,
    DataType,
    noauth,
} from "hyrest";
import { component, inject } from "tsdi";
import { Connection, Transaction, EntityManager, TransactionManager } from "typeorm";
import { verbose, warn, info } from "winston";
import { User } from "../models";
import { signup, world, owner } from "../scopes";
import { Context } from "../context";
import { updateUser } from "../scopes";
import { Token } from "../";

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
    @route("GET", "/users").dump(User, world)
    public async listUsers(): Promise<User[]> {
        return ok(await this.db.getRepository(User).find({
            order: { name: "ASC" },
        }));
    }

    /**
     * Fetch one specific user by id.
     *
     * @param id The id of the user to fetch.
     *
     * @return The specified user.
     */
    @route("GET", "/user/:id").dump(User, world)
    public async getUser(@param("id") @is().validate(uuid) id: string): Promise<User> {
        const user = await this.db.getRepository(User).findOne(id);
        if (!user) { return notFound<User>(`No user with id "${id}"`); }
        return ok(user);
    }

    @route("POST", "/user/:id").dump(User, world)
    public async updateUser(
        @param("id") @is().validate(uuid) id: string,
        @body(updateUser) user: User,
        @context ctx?: Context,
    ): Promise<User> {
        const { admin: currentAdmin, enabled: currentEnabled, id: currentId } = await ctx.currentUser();
        if (!await this.db.getRepository(User).findOne(id)) {
            return notFound<User>(`No sound with id "${id}"`);
        }
        if (user.admin && !currentAdmin) {
            warn(`User ${id} tried to change admin status of user ${user.id}.`);
            return forbidden<User>("Can't update admin status without being admin");
        }
        if (id !== currentId && !currentAdmin) {
            warn(`User ${currentId} tried to change foreign user ${user.id}.`);
            return forbidden<User>("Can't update foreign user without being admin");
        }
        if (id === currentId && currentAdmin && user.admin === false) {
            return forbidden<User>("Can't revoke admin status from yourself");
        }
        if (id === currentId && user.enabled === false) {
            return forbidden<User>("Can't disable yourself");
        }
        await this.db.getRepository(User).update(id, user);
        return ok(await this.getUser(id));
    }

    /**
     * Signup a new user.
     *
     * @param user `name`, `email` and `password` of the new user to create.
     *
     * @return The created user.
     */
    @route("POST", "/user").dump(User, owner) @noauth
    public async createUser(@body(signup) user: User): Promise<User> {
        await this.db.getRepository(User).save(user);
        verbose(`New user ${user.name} with id ${user.id} just signed up`);
        return created(user);
    }
}
