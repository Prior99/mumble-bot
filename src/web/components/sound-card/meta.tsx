import * as React from "react";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import { external } from "tsdi";
import { Image, Icon, Card } from "semantic-ui-react";
import { distanceInWordsToNow } from "date-fns";
import { Sound } from "../../../common";
import { routeUser } from "../../routing";
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
                        {
                            source === "recording" ? (
                                    <Link to={routeUser.path(user.id)}>
                                        <Icon name="microphone" />
                                        <Image className={css.avatar} size="mini" avatar src={user.avatarUrl} />
                                        {user.name}
                                    </Link>
                            ) : (
                                <span>
                                    <Icon name="upload" /> Uploaded
                                </span>
                            )
                        }
                        <Link to={routeUser.path(creator.id)}>
                            <Icon name="user" />
                            <Image className={css.avatar} size="mini" avatar src={creator.avatarUrl} />
                            {creator.name}
                        </Link>
                    </div>
                </Card.Meta>
                <Card.Meta>
                    <Icon name="add to calendar" /> {distanceInWordsToNow(created)} ago
                </Card.Meta>
                <Card.Meta>
                    <Icon name="time" /> {duration.toFixed(2)}s
                </Card.Meta>
            </>
        );
    }
}
