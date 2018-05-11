import * as React from "react";
import { computed, action } from "mobx";
import { observer } from "mobx-react";
import { bind } from "decko";
import { inject, external } from "tsdi";
import { Checkbox, Table } from "semantic-ui-react";
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

    @computed private get id() { return this.props.match.params.id; }

    @computed private get user() { return this.users.byId(this.id); }

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
                <h1>{name}</h1>
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
