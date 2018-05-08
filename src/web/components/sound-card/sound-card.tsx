import * as React from "react";
import { Image, Card  } from "semantic-ui-react";
import { observer } from "mobx-react";
import { Sound } from "../../../common";
import { Description } from "./description";
import { Tags } from "./tags";
import { Meta } from "./meta";
import { Buttons } from "./buttons";

export interface SoundCardProps {
    sound: Sound;
}

declare const baseUrl: string;

@observer
export class SoundCard extends React.Component<SoundCardProps> {
    private get sound() { return this.props.sound; }

    private get visualizationUrl() { return `${baseUrl}/sound/${this.sound.id}/visualized`; }

    public render() {
        const { sound, visualizationUrl } = this;
        return (
            <Card fluid>
                <Image height={80} src={visualizationUrl} />
                <Card.Content>
                    <Card.Description><Description sound={sound} /></Card.Description>
                </Card.Content>
                <Card.Content>
                    <Meta sound={sound} />
                </Card.Content>
                <Card.Content>
                    <Tags sound={sound} />
                </Card.Content>
                <Card.Content extra>
                    <Buttons sound={sound} />
                </Card.Content>
            </Card>
        );
    }
}
