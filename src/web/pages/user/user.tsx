import * as React from "react";
import { computed, action } from "mobx";
import { observer } from "mobx-react";
import { inject, external } from "tsdi";
import { bind } from "decko";
import { Icon } from "semantic-ui-react";

import { Content } from "../../components";
import { UsersStore, OwnUserStore, LoginStore } from "../../../common-ui";
import * as css from "./user.scss";

export interface PageUserProps {
    readonly match: {
        readonly params: {
            readonly id: string;
        };
    };
}

@external @observer
export class PageUser extends React.Component<PageUserProps> {
    @inject private users: UsersStore;
    @inject private ownUser: OwnUserStore;
    @inject private login: LoginStore;

    @computed private get id() { return this.props.match.params.id; }

    @computed private get user() { return this.users.byId(this.id); }

    public render() {
        const { user } = this;
        if (!user) {
            return null;
        }
        const { name, id } = user;
        return (
            <Content>
                <h1>
                    {name}
                </h1>
            </Content>
        );
    }
}
