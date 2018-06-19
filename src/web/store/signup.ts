import { observable, action } from "mobx";
import { bind } from "decko";
import { component, inject } from "tsdi";

import { Users, User } from "../../common";

@component
export class SignupStore {
    @inject private users: Users;

    @observable public signupResult: Boolean;

    @bind @action
    public async signup(email: string, password: string, name: string) {
        const response = await this.users.createUser({ email, password, name } as User);
        if (response) {
            this.signupResult = true;
        }
        return response;
    }
}
