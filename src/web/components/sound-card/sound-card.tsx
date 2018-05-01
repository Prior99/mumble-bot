import * as React from "react";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { external } from "tsdi";
import { Image, Card, Button, Icon, Grid } from "semantic-ui-react";
import { Sound } from "../../../common";
import { routeUser } from "../../routing";
import * as css from "./sound-card.scss";

export interface SoundCardProps {
    sound: Sound;
}

declare const baseUrl: string;

@observer @external
export class SoundCard extends React.Component<SoundCardProps> {
    @computed private get sound() { return this.props.sound; }

    @computed private get visualizationUrl() { return `${baseUrl}/sound/${this.sound.id}/visualized`; }

    public render() {
        const { sound, visualizationUrl } = this;
        const { description, used, user, creator, source } = sound;
        return (
            <Card fluid>
                <Image height={80} src={visualizationUrl} />
                <Card.Content>
                    <Card.Description>{description}</Card.Description>
                    <Card.Meta>
                        <div className={css.flexContainer}>
                            {
                                source === "recording" ? (
                                        <Link to={routeUser.path(user.id)}>
                                            <Icon name="microphone" />
                                            <Image className={css.avatar} size="mini" avatar src={user.avatarUrl} />
                                            {user.name}
                                        </Link>
                                ) : (
                                    <span>
                                        <Icon name="upload" /> This file was uploaded.
                                    </span>
                                )
                            }
                            <Link to={routeUser.path(user.id)}>
                                <Icon name="user" />
                                <Image className={css.avatar} size="mini" avatar src={creator.avatarUrl} />
                                {creator.name}
                            </Link>
                        </div>
                    </Card.Meta>
                </Card.Content>
                <Card.Content extra>
                    <Button
                        content="Play"
                        icon="volume up"
                        label={{ as: "a", basic: true, pointing: "right", content: used }}
                        labelPosition="left"
                    />
                </Card.Content>
            </Card>
        );
    }
}
