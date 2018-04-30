import * as React from "react";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { external, inject } from "tsdi";
import { bind } from "decko";
import { Image, Card, Button, Icon } from "semantic-ui-react";
import { Sound } from "../../../common";

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
                    {
                        source === "recording" ? (
                            <Card.Meta>
                                <Image floated="right" size="mini" avatar src={user.avatarUrl} />
                                <Icon name="microphone" /> {user.name}
                            </Card.Meta>
                        ) : (
                            <Card.Meta>
                                <Icon name="upload" /> This file was uploaded.
                            </Card.Meta>
                        )
                    }
                    <Card.Meta>
                        {
                            creator && <Image floated="right" size="mini" avatar src={creator.avatarUrl} />
                        }
                        <Icon name="user" />
                        {creator ? creator.name : "Unknown"}
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
