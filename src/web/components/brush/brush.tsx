import * as React from "react";
import * as classNames from "classnames";
import { bind } from "decko";
import { observer } from "mobx-react";
import { observable } from "mobx";
import * as css from "./brush.scss";

export interface CachedAudioBrushProps {
    left: number;
    right: number;
    onChange: (left: number, right: number) => void;
}

function clamp(i: number, min: number, max: number) {
    return Math.min(Math.max(i, min), max);
}

@observer
export class Brush extends React.Component<CachedAudioBrushProps> {
    @observable private leftDragging = false;
    @observable private rightDragging = false;
    @observable private brushDragging = false;
    private parent: HTMLElement;
    private lastBrushPosition: number;

    public componentDidMount() {
        window.addEventListener("mousemove", this.handleMouseMove);
        window.addEventListener("mouseup", this.handleMouseUp);
    }

    public componentWillUnmount() {
        window.removeEventListener("mousemove", this.handleMouseMove);
        window.removeEventListener("mouseup", this.handleMouseUp);
    }

    @bind private handleMouseMove(event: MouseEvent) {
        if (!this.parent) { return; }
        const { left, right } = this.props;
        const rect = this.parent.getBoundingClientRect();
        const x = (event.pageX - rect.left) / rect.width;
        if (this.rightDragging) {
            this.props.onChange(left, clamp(x, left, 1));
        }
        if (this.leftDragging) {
            this.props.onChange(clamp(x, 0, right), right);
        }
        if (this.brushDragging) {
            if (typeof this.lastBrushPosition !== "undefined") {
                const delta = x - this.lastBrushPosition;
                this.props.onChange(clamp(left + delta, 0, 1), clamp(right + delta, 0, 1));
            }
            this.lastBrushPosition = x;
        }
    }

    @bind private handleMouseUp() {
        this.rightDragging = false;
        this.leftDragging = false;
        this.brushDragging = false;
        delete this.lastBrushPosition;
    }

    @bind private handleRightMouseDown(event: React.MouseEvent<HTMLDivElement>) {
        this.rightDragging = true;
        event.stopPropagation();
    }

    @bind private handleLeftMouseDown(event: React.MouseEvent<HTMLDivElement>) {
        this.leftDragging = true;
        event.stopPropagation();
    }

    @bind private handleBrushMouseDown(event: React.MouseEvent<HTMLDivElement>) {
        this.brushDragging = true;
        event.stopPropagation();
    }

    @bind private refBrush(div: HTMLDivElement) {
        if (!div) {
            delete this.parent;
            return;
        }
        this.parent = div.parentElement;
    }

    public render() {
        const left = `${this.props.left * 100}%`;
        const width = `${(this.props.right - this.props.left) * 100}%`;
        return (
            <div
                ref={this.refBrush}
                className={classNames(css.brush, { [css.moving]: this.brushDragging })}
                style={{ left, width }}
                onMouseDown={this.handleBrushMouseDown}
            >
                <div
                    className={css.left}
                    onMouseDown={this.handleLeftMouseDown}
                />
                <div
                    className={css.right}
                    onMouseDown={this.handleRightMouseDown}
                />
            </div>
        );
    }
}
