import * as React from "react";
import { Menu, Dropdown } from "semantic-ui-react";
import { inject, external } from "tsdi";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { History } from "history";
import {
    routeDashboard,
    routeUser,
    routeSettings,
    SidebarStore,
    OwnUserStore,
    LoginStore,
} from "../../../common-ui";
import * as css from "./style.scss";

@observer @external
export class AppBar extends React.Component {
    @inject private sidebar: SidebarStore;
    @inject private ownUser: OwnUserStore;
    @inject private login: LoginStore;
    @inject("history") private browserHistory: History;

    @computed private get sidebarButtonVisible() { return !this.sidebar.alwaysOpen && this.login.loggedIn; }

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
