import * as React from "react";
import { Image, Card  } from "semantic-ui-react";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { external, inject } from "tsdi";
import { SoundsStore } from "../../store";
import { Description } from "./description";
import { Tags } from "./tags";
import { Meta } from "./meta";
import { Buttons } from "./buttons";

declare const baseUrl: string;

@observer @external
export class SoundCard extends React.Component<{ id: string }> {
    @inject private sounds: SoundsStore;

    @computed private get sound() { return this.sounds.sounds.get(this.props.id); }

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
