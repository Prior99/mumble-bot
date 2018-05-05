import * as React from "react";
import * as classNames from "classnames";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import * as css from "./cached-audio-slider.scss";

@external @observer
export class CachedAudioSlider extends React.Component {
    public render() {
        const classes = classNames("ui", "card", "fluid", css.container);
        return (
            <div className={classes}>
            </div>
        );
    }
}
