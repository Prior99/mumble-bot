import * as React from "react";
import { external } from "tsdi";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { List, Image } from "semantic-ui-react";
import { PlaylistEntry } from "../../../common";
import { routeUser } from "../../routing";

@external @observer
export class PlaylistEntryComponent extends React.Component<{ playlistEntry: PlaylistEntry }> {
    public render() {
        const { sound } = this.props.playlistEntry;
        const { description, user } = sound;
        return (
            <List.Item>
                <Image avatar src={sound.user.avatarUrl} />
                <List.Content>
                    <List.Header>
                        <Link to={routeUser.path(sound.user.id)}>
                            {sound.user.name}
                        </Link>
                    </List.Header>
                    <List.Description>{sound.description}</List.Description>
                </List.Content>
            </List.Item>
        );
    }
}
