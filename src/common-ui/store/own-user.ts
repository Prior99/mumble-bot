import { observable, computed, action } from "mobx";
import { bind } from "decko";
import { component, initialize, inject } from "tsdi";

import { DatabaseUser, Users } from "../../common";

import { LoginStore } from ".";

@component("OwnUserStore")
export class OwnUserStore {
    @inject private users: Users;
    @inject("LoginStore") private login: LoginStore;

    @observable public user: DatabaseUser;

    @initialize @bind @action
    public async loadUser() {
        if (this.login.loggedIn) {
            this.user = await this.users.getUser(this.login.userId);
        }
    }
}
