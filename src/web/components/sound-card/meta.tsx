import * as React from "react";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import { external } from "tsdi";
import { Image, Icon, Card } from "semantic-ui-react";
import { distanceInWordsToNow } from "date-fns";
import { Sound } from "../../../common";
import { routeUser } from "../../routing";
import { SoundSource } from "../sound-source";
import { MiniUserBadge } from "../mini-user-badge";
import * as css from "./sound-card.scss";

export interface MetaProps {
    sound: Sound;
}

@external @observer
export class Meta extends React.Component<MetaProps> {

    public render() {
        const { user, creator, source, created, duration } = this.props.sound;
        return (
            <>
                <Card.Meta>
                    <div className={css.flexContainer}>
                        <span><SoundSource sound={this.props.sound} /></span>
                        <span><Icon name="add user" /> <MiniUserBadge user={creator} /></span>
                        <span><Icon name="add to calendar" /> {distanceInWordsToNow(created)} ago</span>
                        <span><Icon name="time" /> {duration.toFixed(2)}s</span>
                    </div>
                </Card.Meta>
            </>
        );
    }
}
