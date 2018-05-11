import { observable, action, computed } from "mobx";
import { bind } from "decko";
import { component, initialize, inject } from "tsdi";

import { User, Users } from "../../common";

import { LoginStore } from "./login";

@component("OwnUserStore")
export class OwnUserStore {
    @inject private users: Users;
    @inject("LoginStore") private login: LoginStore;

    @observable public user: User;

    @initialize @bind @action
    public async loadUser() {
        if (this.login.loggedIn) {
            this.user = await this.users.getUser(this.login.userId);
        }
    }

    @computed public get admin() {
        if (!this.user) { return false; }
        return this.user.admin;
    }
}
