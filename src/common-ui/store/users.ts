import { observable, computed, action } from "mobx";
import { bind } from "decko";
import { History } from "history";
import { component, inject, initialize } from "tsdi";

import { DatabaseUser, Users } from "../../common";

import { LoginStore, OwnUserStore } from ".";

@component
export class UsersStore {
    @inject private usersController: Users;

    @observable private users: Map<string, DatabaseUser> = new Map();

    @initialize @bind @action
    private async loadUsers() {
        const users = await this.usersController.listUsers();
        users.forEach(user => {
            this.users.set(user.id, user);
        });
        return users;
    }

    @computed
    public get all(): DatabaseUser[] {
        return Array.from(this.users.values());
    }

    @bind
    public byId(id: string) {
        return this.users.get(id);
    }
}
