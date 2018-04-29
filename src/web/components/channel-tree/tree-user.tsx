import * as React from "react";
import { inject, external } from "tsdi";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { List, Icon, Image } from "semantic-ui-react";
import { MumbleStore, UsersStore } from "../../store";
import { routeUser } from "../../routing";
import { MumbleUser } from "../../../common";
import * as css from "./channel-tree.scss";
import * as unkownUrl from "./unkown.png";

@observer @external
export class TreeUser extends React.Component<{ user: MumbleUser }> {
    @inject private mumble: MumbleStore;
    @inject private users: UsersStore;

    @computed private get linkedUser() {
        return this.mumble.getUser(this.props.user);
    }

    public render() {
        const { linkedUser, props } = this;
        const { name } = props.user;
        return (
            <List.Item>
                {
                    <Image
                        avatar
                        src={this.linkedUser ? this.linkedUser.avatarUrl : unkownUrl}
                        size="mini"
                    />
                }
                <List.Content verticalAlign="middle">
                    <List.Header>
                        {name}
                        {
                            linkedUser && (
                                <Link className={css.link} to={routeUser.path(linkedUser.id)}>
                                    <Icon name="linkify" /> {linkedUser.name}
                                </Link>
                            )
                        }
                    </List.Header>
                </List.Content>
            </List.Item>
        );
    }
}
