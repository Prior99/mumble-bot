import * as React from "react";
import { computed, action } from "mobx";
import { observer } from "mobx-react";
import { inject, external } from "tsdi";
import { bind } from "decko";
import { Icon } from "semantic-ui-react";

import { Content, UserStats, UserCharts, UserTable } from "../../components";
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

    @computed private get followedByCurrentUser() {
        return Boolean(this.ownUser.followershipByFollowingId(this.id));
    }

    @bind @action private async unfollow() { await this.ownUser.removeFollowing(this.id); }
    @bind @action private async follow() { await this.ownUser.addFollowing(this.id); }

    public render() {
        const { user } = this;
        if (!user) {
            return null;
        }
        const { name, id } = user;
        return (
            <Content>
                <h1>
                    {name}{" "}
                    {
                        this.id !== this.login.userId && (
                            this.followedByCurrentUser ? (
                                <Icon color="red" className={css.heart} onClick={this.unfollow} name="heart" />
                            ) : (
                                <Icon color="red" className={css.heart} onClick={this.follow} name="empty heart" />
                            )
                        )
                    }
                </h1>
                <UserStats userId={id} />
                <br />
                <UserTable user={user} />
                <br />
                <UserCharts userId={id} />
            </Content>
        );
    }
}
