import * as React from "react";
import { computed, action, observable } from "mobx";
import { observer } from "mobx-react";
import { bind } from "decko";
import { inject, external, initialize } from "tsdi";
import { Checkbox, Table, Icon, Button, Input } from "semantic-ui-react";
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

    @computed private get id() { return this.props.match.params.id; }

    @computed private get user() { return this.users.byId(this.id); }

    @computed private get canEditName() {
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
                                this.canEditName &&
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
            </Content>
        );
    }
}
