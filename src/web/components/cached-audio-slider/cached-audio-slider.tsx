import * as React from "react";
import * as classNames from "classnames";
import { bind } from "decko";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { computed } from "mobx";
import * as css from "./cached-audio-slider.scss";
import { CachedAudioStore } from "../../store";
import { CachedAudioBlock } from "./cached-audio-block";
import { CachedAudioBrush } from "./cached-audio-brush";

@external @observer
export class CachedAudioSlider extends React.Component {
    @inject private cachedAudio: CachedAudioStore;

    private brushing = false;
    private originX: number;
    private container: HTMLDivElement;

    public componentDidMount() {
        window.addEventListener("mousemove", this.handleMouseMove);
        window.addEventListener("mouseup", this.handleMouseUp);
    }

    public componentWillUnmount() {
        window.removeEventListener("mousemove", this.handleMouseMove);
        window.removeEventListener("mouseup", this.handleMouseUp);
    }

    @bind private handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
        const rect = this.container.getBoundingClientRect();
        this.originX = (event.screenX - rect.left) / rect.width;
        this.brushing = true;
        event.stopPropagation();
    }

    @bind private handleMouseMove(event: MouseEvent) {
        if (!this.container || !this.brushing) { return; }
        const { totalRange, oldestTime } = this.cachedAudio;
        const rect = this.container.getBoundingClientRect();
        const x = (event.screenX - rect.left) / rect.width;
        this.cachedAudio.selectionStart = new Date(Math.min(x, this.originX) * totalRange + oldestTime);
        this.cachedAudio.selectionEnd = new Date(Math.max(x, this.originX) * totalRange + oldestTime);
        event.stopPropagation();
    }

    @bind private handleMouseUp() {
        this.brushing = false;
        delete this.originX;
    }

    @bind private handleBrushChange(left: number, right: number) {
        const { totalRange, oldestTime } = this.cachedAudio;
        this.cachedAudio.selectionStart = new Date(oldestTime + left * totalRange);
        this.cachedAudio.selectionEnd = new Date(oldestTime + right * totalRange);
    }

    @computed private get brushLeft() {
        const { totalRange, selectionStart, oldestTime } = this.cachedAudio;
        return (selectionStart.getTime() - oldestTime) / totalRange;
    }

    @computed private get brushRight() {
        const { totalRange, oldestTime, selectionEnd } = this.cachedAudio;
        return (selectionEnd.getTime() - oldestTime) / totalRange;
    }

    @bind private refContainer(div: HTMLDivElement) {
        if (!div) {
            delete this.container;
            return;
        }
        this.container = div;
    }

    public render() {
        const classes = classNames("ui", "card", "fluid", css.container);
        return (
            <div
                className={classes}
                ref={this.refContainer}
                onMouseDown={this.handleMouseDown}
            >
                <div />
                {
                    this.cachedAudio.all.map(cachedAudio => (
                        <CachedAudioBlock cachedAudio={cachedAudio} key={cachedAudio.id} />
                    ))
                }
                {
                    this.cachedAudio.selectionDefined && (
                        <CachedAudioBrush
                            left={this.brushLeft}
                            right={this.brushRight}
                            onChange={this.handleBrushChange}
                        />
                    )
                }
                <div />
            </div>
        );
    }
}
