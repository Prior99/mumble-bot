import * as React from "react";
import { inject, external } from "tsdi";
import { observer } from "mobx-react";
import { List } from "semantic-ui-react";
import { MumbleStore } from "../../../common-ui";
import { Channel, MumbleUser } from "../../../common";

function TreeUser({ user }: { user: MumbleUser }) {
    const { name } = user;
    return (
        <List.Item>
            <List.Icon name="user" />
            <List.Content>
                <List.Header>{name}</List.Header>
            </List.Content>
        </List.Item>
    );
}

function TreeChannel({ channel }: { channel: Channel }) {
    const { name, users, children } = channel;
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

@observer @external
export class ChannelTree extends React.Component {
    @inject private mumble: MumbleStore;

    public render() {
        const { channelTree } = this.mumble;
        if (!channelTree) { return null; }
        return (
            <List>
                <TreeChannel channel={channelTree} />
            </List>
        );
    }
}
