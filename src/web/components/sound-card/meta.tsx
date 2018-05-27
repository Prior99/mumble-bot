import * as React from "react";
import { observer } from "mobx-react";
import { action } from "mobx";
import { bind } from "decko";
import { external, inject } from "tsdi";
import { Icon, Card, Rating } from "semantic-ui-react";
import { distanceInWordsToNow } from "date-fns";
import { Sound } from "../../../common";
import { MiniUserBadge } from "../mini-user-badge";
import { SoundSource } from "../sound-source";
import * as css from "./sound-card.scss";
import { SoundsStore } from "../../store";

export interface MetaProps {
    sound: Sound;
}

@external @observer
export class Meta extends React.Component<MetaProps> {
    @inject private sounds: SoundsStore;

    @bind @action private async handleRate(_: React.MouseEvent<HTMLDivElement>, { rating }: { rating: number }) {
        await this.sounds.rate(this.props.sound.id, rating);
    }

    public render() {
        const { creator, created, duration, rating } = this.props.sound;
        return (
            <>
                <Card.Meta>
                    <div className={css.flexContainer}>
                        <span><SoundSource sound={this.props.sound} /></span>
                        <span><Icon name="add user" /> <MiniUserBadge user={creator} /></span>
                        <span><Icon name="add to calendar" /> {distanceInWordsToNow(created)} ago</span>
                        <span><Icon name="time" /> {duration.toFixed(2)}s</span>
                        <span>
                            <Rating icon="star" onRate={this.handleRate} maxRating={5} rating={rating} />
                        </span>
                    </div>
                </Card.Meta>
            </>
        );
    }
}
