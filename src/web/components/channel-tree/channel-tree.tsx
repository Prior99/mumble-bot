import * as React from "react";
import { inject, external } from "tsdi";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { List, Icon } from "semantic-ui-react";
import { MumbleStore, UsersStore } from "../../../common-ui";
import { Channel, MumbleUser } from "../../../common";
import * as css from "./channel-tree.scss";

@observer @external
export class TreeUser extends React.Component<{ user: MumbleUser }> {
    @inject private mumble: MumbleStore;
    @inject private users: UsersStore;

    @computed private get isLinked() {
        return this.mumble.isMumbleUserLinked(this.props.user);
    }

    @computed private get linkedUser() {
        return this.mumble.getUser(this.props.user);
    }

    public render() {
        const { isLinked, linkedUser, props } = this;
        const { name } = props.user;
        return (
            <List.Item>
                <List.Icon name="user" />
                <List.Content>
                    <List.Header>
                        {name}
                        {
                            isLinked && <span className={css.link}>
                                <Icon name="linkify" />
                                {linkedUser ? linkedUser.name : "Loading"}
                            </span>
                        }
                    </List.Header>
                </List.Content>
            </List.Item>
        );
    }
}

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
