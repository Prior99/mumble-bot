import * as React from "react";
import { List } from "semantic-ui-react";
import { Channel } from "../../../common";
import { TreeUser } from "./tree-user";

export class TreeChannel extends React.Component<{ channel: Channel }> {
    public render() {
        const { name, users, children } = this.props.channel;
        return (
            <List.Item>
                <List.Icon name="folder" />
                <List.Content>
                    <List.Header>{name}</List.Header>
                    <List.List>
                        {children.map(child => <TreeChannel key={child.name} channel={child} />)}
                        {users.map(user => <TreeUser key={user.name} user={user} />)}
                    </List.List>
                </List.Content>
            </List.Item>
        );
    }
}
