import { body, controller, route, param, is, uuid, ok } from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";

import { DatabaseUser } from "../models";
import { createUser } from "../scopes";

@controller @component
export class Users {
    @inject private db: Connection;

    @route("GET", "/users")
    public async listUsers(): Promise<DatabaseUser[]> {
        return ok([]);
    }

    @route("GET", "/user/:id")
    public async getUser(@param("id") @is().validate(uuid) id: string): Promise<DatabaseUser> {
        return ok();
    }

    @route("POST", "/user")
    public async createUser(@body(createUser) user: DatabaseUser): Promise<DatabaseUser> {
        return ok();
    }
}
