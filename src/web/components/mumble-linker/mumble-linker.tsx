import * as React from "react";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { bind } from "decko";
import { Checkbox, Form } from "semantic-ui-react";
import { MumbleStore } from "../../../common-ui";
import { MumbleUser } from "../../../common";

@observer @external
export class MumbleLinker extends React.Component {
    @inject private mumble: MumbleStore;

    @bind private renderMumbleUser(mumbleUser: MumbleUser) {
        const { id, name } = mumbleUser;
        const disabled = !this.mumble.isLinkable(mumbleUser);
        const checked = this.mumble.isLinkedToThisUser(mumbleUser);
        return (
            <Form.Field key={id}>
                <Checkbox
                    label={name}
                    disabled={disabled}
                    checked={checked}
                    onClick={() => this.mumble.link(mumbleUser)}
                />
            </Form.Field>
        );
    }

    public render() {
        return (
            <Form>
                {this.mumble.users.map(user => this.renderMumbleUser(user))}
            </Form>
        );
    }
}
