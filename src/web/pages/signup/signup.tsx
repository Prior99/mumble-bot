import * as React from "react";
import { Link } from "react-router-dom";
import { observable, action, computed } from "mobx";
import { observer } from "mobx-react";
import { inject, external } from "tsdi";
import { bind } from "decko";
import { Input, Button, Form, Modal, Icon } from "semantic-ui-react";
import { SignupStore } from "../../store";
import { routeLogin } from "../../routing";
import { Content } from "../../components";

@external @observer
export class PageSignup extends React.Component {
    @inject private signup: SignupStore;

    @observable private email = "";
    @observable private password = "";
    @observable private repeat = "";
    @observable private name = "";

    @bind @action private handleEmail({ target }: React.SyntheticInputEvent) { this.email = target.value; }
    @bind @action private handleName({ target }: React.SyntheticInputEvent) { this.name = target.value; }
    @bind @action private handlePassword({ target }: React.SyntheticInputEvent) { this.password = target.value; }
    @bind @action private handleRepeat({ target }: React.SyntheticInputEvent) { this.repeat = target.value; }
    @bind private handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        this.signup.signup(this.email, this.password, this.name);
    }

    @computed private get repeatValid() { return this.repeat === this.password; }
    @computed private get passwordValid() { return this.password.length >= 8; }
    @computed private get nameValid() { return this.name.length >= 5; }
    @computed private get emailValid() { return this.email.length >= 5; }
    @computed private get allValid() {
        return this.repeatValid && this.passwordValid && this.emailValid && this.nameValid;
    }

    public render() {
        return (
            <Content>
                <h1>Signup</h1>
                <Form size="large" onSubmit={this.handleSubmit}>
                    <Form.Field error={!this.nameValid}>
                        <Input
                            size="large"
                            icon="user"
                            iconPosition="left"
                            focus
                            placeholder="Username"
                            value={this.name}
                            onChange={this.handleName}
                        />
                    </Form.Field>
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
                            placeholder="Password"
                            value={this.password}
                            onChange={this.handlePassword}
                        />
                    </Form.Field>
                    <Form.Field error={!this.repeatValid}>
                        <Input
                            size="large"
                            icon="repeat"
                            type="password"
                            iconPosition="left"
                            focus
                            placeholder="Repeat"
                            value={this.repeat}
                            onChange={this.handleRepeat}
                        />
                    </Form.Field>
                    <Button disabled={!this.allValid} type="submit" fluid color="violet">Signup</Button>
                </Form>
                <p>Already have an account? Login <Link to={routeLogin.path()}>here</Link>.</p>
                {
                    this.signup.signupResult && (
                        <Modal open>
                            <Modal.Header>
                                <Icon color="green" name="check" /> Successfully Signed Up!
                            </Modal.Header>
                            <Modal.Content>
                                <Modal.Description>
                                    <p>
                                        Your account was successfully created,
                                        however it still needs to be enabled by an administrator.
                                    </p>
                                    <p>Please contact an administrator and ask them to enable your account.</p>
                                </Modal.Description>
                            </Modal.Content>
                        </Modal>
                    )
                }
            </Content>
        );
    }
}
