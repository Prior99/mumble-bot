import * as React from "react";
import { computed, action, observable } from "mobx";
import { observer } from "mobx-react";
import { bind } from "decko";
import { inject, external, initialize } from "tsdi";
import { Checkbox, Table, Icon, Button, Input, Form, Message } from "semantic-ui-react";
import { Content } from "../../components";
import { User } from "../../../common";
import { UsersStore, OwnUserStore } from "../../store";

export interface PageUserProps {
    readonly match: {
        readonly params: {
            readonly id: string;
        };
    };
}

@external @observer
export class PageUser extends React.Component<PageUserProps> {
    @inject private users: UsersStore;
    @inject private ownUser: OwnUserStore;

    @observable private name = "";
    @observable private editName = false;
    @observable private nameLoading = false;
    @observable private password = "";
    @observable private repeat = "";
    @observable private passwordLoading = false;
    @observable private passwordChanged = false;

    @initialize
    protected initialize() {
        this.name = this.user.name;
    }

    @bind @action private handleStartEditName() { this.editName = true; }

    @bind @action private async handleAbortEditName() {
        this.name = this.user.name;
        this.editName = false;
    }

    @bind @action private async handleFinishEditName() {
        const { name } = this;
        if (name !== this.user.name) {
            this.nameLoading = true;
            await this.users.updateUser(this.user.id, { name } as User);
            this.nameLoading = false;
        }
        this.editName = false;
    }

    @bind @action private handleNameChange(event: React.SyntheticInputEvent) {
        this.name = event.target.value;
    }

    @bind @action private handleNameKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        switch (event.key) {
            case "Enter":
                this.handleFinishEditName(); break;
            case "Esc":
            case "Escape":
                this.handleAbortEditName(); break;
            case "Tab":
                this.handleAbortEditName(); break;
            default: break;
        }
    }

    @bind @action private handlePassword({ target }: React.SyntheticInputEvent) { this.password = target.value; }

    @bind @action private handleRepeat({ target }: React.SyntheticInputEvent) { this.repeat = target.value; }

    @bind private async handleChangePasswordSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        this.passwordLoading = true;
        await this.users.updateUser(this.user.id, { password: this.password } as User);
        this.password = "";
        this.repeat = "";
        this.passwordLoading = false;
        this.passwordChanged = true;
    }

    @computed private get repeatValid() { return this.repeat === this.password; }
    @computed private get passwordValid() { return this.password.length >= 8; }
    @computed private get allValid() {
        return this.repeatValid && this.passwordValid;
    }

    @computed private get id() { return this.props.match.params.id; }

    @computed private get user() { return this.users.byId(this.id); }

    @computed private get canEdit() {
        if (!this.user || !this.ownUser || !this.ownUser.user) { return false; }
        return this.ownUser.user.id === this.user.id || this.ownUser.admin;
    }

    @bind @action private async handleEnableChange() {
        if (!this.ownUser.admin) { return; }
        await this.users.updateUser(this.user.id, { enabled: !this.user.enabled } as User);
    }

    @bind @action private async handleAdminChange() {
        if (!this.ownUser.admin) { return; }
        await this.users.updateUser(this.user.id, { admin: !this.user.admin } as User);
    }

    public render() {
        const { user } = this;
        if (!user) {
            return null;
        }
        const { name, enabled, admin } = user;
        return (
            <Content>
                {
                    this.passwordChanged && (
                        <Message positive onDismiss={() => this.passwordChanged = false}>
                            <Message.Header><Icon name="check" />Password Changed</Message.Header>
                            <p>Your password was changed successfully.</p>
                        </Message>
                    )
                }
                {
                    this.editName ? <>
                        <Input
                            label={
                                <Button
                                    icon="checkmark"
                                    onClick={this.handleFinishEditName}
                                    loading={this.nameLoading}
                                    disabled={this.nameLoading}
                                    color="green"
                                />
                            }
                            ref={element => element && element.focus()}
                            disabled={this.nameLoading}
                            labelPosition="right"
                            fluid
                            value={this.name}
                            onChange={this.handleNameChange}
                            onKeyDown={this.handleNameKeyDown}
                        />
                    </> : <>
                        <h1>
                            {`${name} `}
                            {
                                this.canEdit &&
                                <Icon name="pencil" color="grey" link onClick={this.handleStartEditName} />
                            }
                        </h1>
                    </>
                }
                <Table>
                    <Table.Row>
                        <Table.Cell>Administrator</Table.Cell>
                        <Table.Cell>
                            <Checkbox
                                toggle
                                onChange={this.handleAdminChange}
                                checked={admin}
                                disabled={!this.ownUser.admin}
                            />
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Enabled</Table.Cell>
                        <Table.Cell>
                            <Checkbox
                                toggle
                                onChange={this.handleEnableChange}
                                checked={enabled}
                                disabled={!this.ownUser.admin}
                            />
                        </Table.Cell>
                    </Table.Row>
                </Table>
                {
                    this.canEdit && (
                        <Form loading={this.passwordLoading} size="large" onSubmit={this.handleChangePasswordSubmit}>
                            <h3>Change Password</h3>
                            <Form.Field error={!this.passwordValid}>
                                <Input
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
                                    icon="repeat"
                                    type="password"
                                    iconPosition="left"
                                    focus
                                    placeholder="Repeat"
                                    value={this.repeat}
                                    onChange={this.handleRepeat}
                                />
                            </Form.Field>
                            <Button
                                disabled={!this.allValid}
                                type="submit"
                                fluid
                                color="violet"
                            >
                                Change Password
                            </Button>
                        </Form>
                    )
                }
            </Content>
        );
    }
}
