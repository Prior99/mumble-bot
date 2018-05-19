import * as React from "react";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { Link } from "react-router-dom";
import { List, Image, Icon } from "semantic-ui-react";
import { PlaylistEntry } from "../../../common";
import { routeUser, routeSound } from "../../routing";
import { UsersStore } from "../../store";
import * as css from "./playlist-card.scss";

@external @observer
export class PlaylistEntryComponent extends React.Component<{ playlistEntry: PlaylistEntry }> {
    @inject private users: UsersStore;

    @computed private get user() {
        const { sound } = this.props.playlistEntry;
        if (!sound.user) { return; }
        return this.users.byId(sound.user.id);
    }

    private renderIcon() {
        const { sound } = this.props.playlistEntry;
        switch (sound.source) {
            case "recording": return <Image avatar src={this.user.avatarUrl} />;
            case "youtube": return <Icon className={css.sourceIcon} name="youtube play"/>;
            default: case "upload": return <Icon className={css.sourceIcon} name="upload" />;
        }
    }

    private renderSourceText() {
        const { sound } = this.props.playlistEntry;
        switch (sound.source) {
            case "recording": return (
                <List.Header>
                    <Link to={routeUser.path(this.user.id)}>
                        <span className={css.sourceText}>{this.user.name}</span>
                    </Link>
                </List.Header>
            );
            case "youtube": return <span className={css.sourceText}>YouTube Video</span>;
            default: case "upload": return <span className={css.sourceText}>Uploaded Sound</span>;
        }
    }

    public render() {
        const { sound } = this.props.playlistEntry;
        const { description, id } = sound;
        return (
            <List.Item>
                { this.renderIcon() }
                <List.Content>
                    { this.renderSourceText() }
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
