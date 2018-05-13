import * as React from "react";
import { external } from "tsdi";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { List, Image } from "semantic-ui-react";
import { PlaylistEntry } from "../../../common";
import { routeUser, routeSound } from "../../routing";

@external @observer
export class PlaylistEntryComponent extends React.Component<{ playlistEntry: PlaylistEntry }> {
    public render() {
        const { sound } = this.props.playlistEntry;
        const { description, user, id } = sound;
        return (
            <List.Item>
                <Image avatar src={user.avatarUrl} />
                <List.Content>
                    <List.Header>
                        <Link to={routeUser.path(user.id)}>
                            {user.name}
                        </Link>
                    </List.Header>
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
