import * as React from "react";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { bind } from "decko";
import { List, Image, Icon } from "semantic-ui-react";
import { UsersStore } from "../../store";
import { User } from "../../../common";
import { History } from "history";
import { routeUser } from "../../routing";

@observer @external
export class UserList extends React.Component {
    @inject private users: UsersStore;
    @inject("history") private history: History;

    @bind private handleClick(id: string) {
        this.history.push(routeUser.path(id));
    }

    @bind private renderUser(user: User) {
        const { id, name, avatarUrl, enabled, admin } = user;
        return (
            <List.Item onClick={() => this.handleClick(id)}>
                <Image avatar src={avatarUrl} size="mini" />
                <List.Content>
                    <List.Header>
                        {name}
                        { !enabled && <Icon color="red" name="lock" /> }
                        { admin && <Icon color="green" name="wizard" /> }
                    </List.Header>
                </List.Content>
            </List.Item>
        );
    }

    public render() {
        return (
            <List selection verticalAlign="middle">
                {this.users.all.map(user => this.renderUser(user))}
            </List>
        );
    }
}
