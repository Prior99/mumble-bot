import * as React from "react";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { Link } from "react-router-dom";
import { List, Image } from "semantic-ui-react";
import { PlaylistEntry } from "../../../common";
import { routeUser, routeSound } from "../../routing";
import { UsersStore } from "../../store";

@external @observer
export class PlaylistEntryComponent extends React.Component<{ playlistEntry: PlaylistEntry }> {
    @inject private users: UsersStore;

    @computed private get user() {
        const { sound } = this.props.playlistEntry;
        if (!sound.user) { return; }
        return this.users.byId(sound.user.id);
    }

    public render() {
        const { sound } = this.props.playlistEntry;
        const { description, id } = sound;
        return (
            <List.Item>
                { this.user && <Image avatar src={this.user.avatarUrl} /> }
                <List.Content>
                    {
                        this.user && (
                            <List.Header>
                                <Link to={routeUser.path(this.user.id)}>
                                    {this.user.name}
                                </Link>
                            </List.Header>
                        )
                    }
                    <List.Description>
                        <Link to={routeSound.path(id)}>
                            {description}
                        </Link>
                    </List.Description>
                </List.Content>
            </List.Item>
        );
    }
}
