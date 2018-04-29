import * as React from "react";
import { inject, external } from "tsdi";
import { observer } from "mobx-react";
import { List } from "semantic-ui-react";
import { MumbleStore } from "../../store";
import { TreeChannel } from "./tree-channel";

@observer @external
export class ChannelTree extends React.Component {
    @inject private mumble: MumbleStore;

    public render() {
        const { channelTree } = this.mumble;
        if (!channelTree) { return null; }
        return (
            <List>
                <TreeChannel channel={channelTree} />
            </List>
        );
    }
}
