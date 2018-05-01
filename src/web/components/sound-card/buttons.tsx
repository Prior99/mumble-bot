import * as React from "react";
import { observer } from "mobx-react";
import { external } from "tsdi";
import { Button  } from "semantic-ui-react";
import { Sound } from "../../../common";

export interface ButtonsProps {
    sound: Sound;
}

@observer @external
export class Buttons extends React.Component<ButtonsProps> {
    public render() {
        const { used } = this.props.sound;
        return (
            <>
                <Button
                    content="Play"
                    icon="volume up"
                    label={{ as: "a", basic: true, pointing: "right", content: used }}
                    labelPosition="left"
                />
            </>
        );
    }
}
