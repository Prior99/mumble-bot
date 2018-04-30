import { observable, computed, action } from "mobx";
import { bind } from "decko";
import { component, inject, initialize } from "tsdi";

import { User, Users } from "../../common";

import { LoginStore, OwnUserStore } from ".";

@component({ name: "UsersStore" })
export class UsersStore {
    @inject private usersController: Users;

    @observable private users: Map<string, User> = new Map();

    @initialize @bind @action
    protected async loadUsers() {
        const users = await this.usersController.listUsers();
        users.forEach(user => {
            this.users.set(user.id, user);
        });
        return users;
    }

    @computed
    public get all(): User[] {
        return Array.from(this.users.values());
    }

    @bind
    public byId(id: string) {
        return this.users.get(id);
    }
}