import * as React from "react";
import { Link } from "react-router-dom";
import { observable, action, computed } from "mobx";
import { observer } from "mobx-react";
import { inject, external } from "tsdi";
import bind from "bind-decorator";
import { Input, Button, Form } from "semantic-ui-react";

import { routeSignup, LoginStore } from "../../../common-ui";
import { Content } from "../../components";

@external @observer
export class PageLogin extends React.Component {
    @inject private login: LoginStore;

    @observable private email = "";
    @observable private password = "";

    @bind @action private handleEmail({ target }: React.SyntheticInputEvent) { this.email = target.value; }
    @bind @action private handlePassword({ target }: React.SyntheticInputEvent) { this.password = target.value; }
    @bind private async handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        await this.login.login(this.email, this.password);
    }

    @computed private get passwordValid() { return this.password.length >= 8; }
    @computed private get emailValid() { return this.email.length >= 5; }
    @computed private get allValid() {
        return this.passwordValid && this.emailValid;
    }

    public render() {
        return (
            <Content>
                <h1>Mumble Bot</h1>
                <Form size="large" onSubmit={this.handleSubmit}>
                    <Form.Field error={!this.emailValid}>
                        <Input
                            size="large"
                            icon="user"
                            iconPosition="left"
                            focus
                            placeholder="Email"
                            value={this.email}
                            onChange={this.handleEmail}
                        />
                    </Form.Field>
                    <Form.Field error={!this.passwordValid}>
                        <Input
                            size="large"
                            icon="lock"
                            type="password"
                            iconPosition="left"
                            focus
                            placeholder={"Password"}
                            value={this.password}
                            onChange={this.handlePassword}
                        />
                    </Form.Field>
                    <Button disabled={!this.allValid} type="submit" fluid color="green">Login</Button>
                </Form>
                <p>Don't have an account? Signup <Link to={routeSignup.path()}>here</Link>.</p>
            </Content>
        );
    }
}
