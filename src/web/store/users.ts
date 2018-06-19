import { observable, computed, action } from "mobx";
import { bind } from "decko";
import { component, inject, initialize } from "tsdi";

import { User, Users } from "../../common";

@component({ name: "UsersStore" })
export class UsersStore {
    @inject private usersController: Users;

    @observable public loading = true;
    @observable private users: Map<string, User> = new Map();

    @initialize @bind @action
    protected async loadUsers() {
        const users = await this.usersController.listUsers();
        users.forEach(user => {
            this.users.set(user.id, user);
        });
        this.loading = false;
        return users;
    }

    @computed
    public get all(): User[] {
        return Array.from(this.users.values());
    }

    @computed
    public get alphabetical(): User[] {
        return this.all.sort((a, b) => {
            if (a.name > b.name) { return 1; }
            if (a.name < b.name) { return -1; }
            return 0;
        });
    }

    @bind public byId(id: string) {
        return this.users.get(id);
    }

    @bind @action public async updateUser(id: string, user: User) {
        this.users.set(id, await this.usersController.updateUser(id, user));
    }

    @computed public get dropdownOptions() {
        return this.all.map(user => ({
            key: user.id,
            value: user.id,
            text: user.name,
        }));
    }
}
