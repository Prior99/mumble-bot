import * as React from "react";
import { Menu, Dropdown, Image } from "semantic-ui-react";
import { inject, external } from "tsdi";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { History } from "history";
import {
    SidebarStore,
    OwnUserStore,
    LoginStore,
} from "../../store";
import {
    routeDashboard,
    routeUser,
    routeSettings,
} from "../../routing";
import * as css from "./style.scss";

@observer @external
export class AppBar extends React.Component {
    @inject private sidebar: SidebarStore;
    @inject private ownUser: OwnUserStore;
    @inject private login: LoginStore;
    @inject("history") private browserHistory: History;

    @computed private get sidebarButtonVisible() { return !this.sidebar.alwaysOpen && this.login.loggedIn; }
    @computed private get avatar() { return this.ownUser.user && this.ownUser.user.avatarUrl; }

    public render() {
        const { user } = this.ownUser;
        return (
            <Menu color="violet" inverted className={css.appBar} attached>
                <Menu.Menu position={"left" as "right"}>
                    {
                        this.sidebarButtonVisible &&
                        <Menu.Item
                            icon="bars"
                            onClick={this.sidebar.toggleVisibility}
                        />
                    }
                </Menu.Menu>
                <Menu.Menu position="right">
                    {
                        user && [
                            <Dropdown
                                item
                                key="user"
                                text={user.name}
                                icon={<Image className={css.avatar} circular size="mini" src={this.avatar} />}
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
                                    <Dropdown.Item
                                        content="Settings"
                                        onClick={() => this.browserHistory.push(routeSettings.path())}
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
