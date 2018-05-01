import * as React from "react";
import { action } from "mobx";
import { bind } from "decko";
import { Label, Icon } from "semantic-ui-react";
import { Tag } from "../../../common";

export interface TagLabelProps {
    tag: Tag;
    onClick?: () => void;
    onRemove?: () => void;
}

export class TagLabel extends React.Component<TagLabelProps> {
    private handleClick() {
        if (this.props.onClick) { this.props.onClick(); }
    }

    @bind @action private handleRemove() {
        if (this.props.onRemove) { this.props.onRemove(); }
    }

    public render() {
        const { tag, onRemove } = this.props;
        return (
            <Label onClick={this.handleClick}>
                {tag.name}
                {
                    onRemove && <Icon name="delete" onClick={this.handleRemove} />
                }
            </Label>
        );
    }
}
