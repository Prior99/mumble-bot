import * as React from "react";
import { Sidebar, Menu, Dropdown, Image } from "semantic-ui-react";
import { inject, external } from "tsdi";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { History } from "history";

import {
    routeGame,
    routeGames,
    routeDashboard,
    routeFollow,
    routeUser,
    SidebarStore,
    OwnUserStore,
    LoginStore,
    GamesStore,
    UsersStore,
} from "../../../common-ui";
import { formatRank } from "../../../common";
import { Errors } from "..";
import * as css from "./style.scss";

@external @observer
export class AppBar extends React.Component {
    @inject private sidebar: SidebarStore;
    @inject private ownUser: OwnUserStore;
    @inject private login: LoginStore;
    @inject private games: GamesStore;
    @inject private browserHistory: History;
    @inject private users: UsersStore;

    @computed private get sidebarButtonVisible() { return !this.sidebar.alwaysOpen && this.login.loggedIn; }
    @computed private get avatar() { return this.ownUser.user && this.ownUser.user.avatarUrl; }

    public render() {
        const { userStats, user } = this.ownUser;
        return (
            <Menu color="green" inverted className={css.appBar} attached>
                <Menu.Menu position={"left" as "right"}>
                    {
                        this.sidebarButtonVisible &&
                        <Menu.Item
                            icon="bars"
                            onClick={this.sidebar.toggleVisibility}
                        />
                    }
                    {
                        userStats && user && [
                            <Menu.Item
                                icon="clock"
                                content={`${userStats.active} Active`}
                                key="active"
                                onClick={() => this.browserHistory.push(routeGames.path())}
                                className={css.weak}
                            />,
                            this.games.possibleTurns.length > 0 ? (
                                <Dropdown
                                    item
                                    text={`${this.games.possibleTurns.length} Possible Turns`}
                                    key="turns"
                                >
                                    <Dropdown.Menu>
                                        <Dropdown.Header>Games</Dropdown.Header>
                                        {
                                            this.games.possibleTurns.map(game => (
                                                <Dropdown.Item
                                                    key={game.id}
                                                    content={this.games.format(game)}
                                                    onClick={() => this.browserHistory.push(routeGame.path(game.id))}
                                                />
                                            ))
                                        }
                                    </Dropdown.Menu>
                                </Dropdown>
                            ) : (
                                <Menu.Item content="No possible turns" key="turns" />
                            ),
                        ]
                    }
                </Menu.Menu>
                <Menu.Menu position="right">
                    {
                        userStats && user && [
                            <Menu.Item
                                icon="group"
                                content={`Following ${this.ownUser.allFollowing.length}`}
                                key="following"
                                onClick={() => this.browserHistory.push(routeFollow.path())}
                                className={css.veryweak}
                            />,
                            <Menu.Item
                                icon="group"
                                content={`Followers ${this.ownUser.allFollowers.length}`}
                                key="followers"
                                onClick={() => this.browserHistory.push(routeFollow.path())}
                                className={css.veryweak}
                            />,
                            <Menu.Item
                                icon="star"
                                content={formatRank(user.rating)}
                                key="rating"
                                onClick={() => this.browserHistory.push(routeDashboard.path())}
                                className={css.weak}
                            />,
                            <Dropdown
                                item
                                key="user"
                                trigger={<Image circular size="mini" src={this.avatar} />}
                            >
                                <Dropdown.Menu>
                                    <Dropdown.Header>Logged in in as {this.ownUser.user.name}</Dropdown.Header>
                                    <Dropdown.Item
                                        content="Dashboard"
                                        onClick={() => this.browserHistory.push(routeDashboard.path())}
                                    />
                                    <Dropdown.Item
                                        content="Profile"
                                        onClick={() => this.browserHistory.push(routeUser.path(this.login.userId))}
                                    />
                                    <Dropdown.Item content="Logout" onClick={this.login.logout} />
                                </Dropdown.Menu>
                            </Dropdown>,
                        ]
                    }
                </Menu.Menu>
            </Menu>
        );
    }
}
