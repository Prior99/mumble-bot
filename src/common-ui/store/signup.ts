import { observable, computed, action } from "mobx";
import { bind } from "decko";
import { component, inject } from "tsdi";

import { Users, DatabaseUser } from "../../common";
import { LoginStore, OwnUserStore } from ".";
import { routeDashboard } from "../routing";

@component
export class SignupStore {
    @inject private login: LoginStore;
    @inject private users: Users;
    @inject private ownUser: OwnUserStore;

    @observable public signupResult: Boolean;

    @bind @action
    public async signup(email: string, password: string, name: string) {
        const body = { email, password };
        const response = await this.users.createUser({ email, password, name } as DatabaseUser);
        if (response) {
            await this.login.login(email, password);
            await this.ownUser.loadUser();
        }
        return response;
    }
}
