import * as React from "react";
import { computed } from "mobx";
import { observer } from "mobx-react";
import { inject, external } from "tsdi";
import { Content } from "../../components";
import { UsersStore } from "../../store";

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

    @computed private get id() { return this.props.match.params.id; }

    @computed private get user() { return this.users.byId(this.id); }

    public render() {
        const { user } = this;
        if (!user) {
            return null;
        }
        const { name } = user;
        return (
            <Content>
                <h1>
                    {name}
                </h1>
            </Content>
        );
    }
}
