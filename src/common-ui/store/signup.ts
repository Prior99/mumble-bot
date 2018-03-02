import { observable, computed, action } from "mobx";
import { bind } from "decko";
import { History } from "history";
import { component, inject } from "tsdi";

import { Users, User } from "../../common";
import { LoginStore, OwnUserStore } from ".";
import { routeDashboard } from "../routing";

@component
export class SignupStore {
    @inject private login: LoginStore;
    @inject private users: Users;
    @inject private ownUser: OwnUserStore;
    @inject private browserHistory: History;

    @observable public signupResult: Boolean;

    @bind @action
    public async signup(email: string, password: string, name: string) {
        const body = { email, password };
        const response = await this.users.createUser({ email, password, name } as User);
        if (response) {
            await this.login.login(email, password);
            await this.ownUser.loadUser();
            this.browserHistory.replace(routeDashboard.path());
        }
        return response;
    }
}
