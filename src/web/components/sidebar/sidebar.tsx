import * as React from "react";
import { Sidebar, Menu, Icon } from "semantic-ui-react";
import { observer } from "mobx-react";
import { inject, external } from "tsdi";
import { History } from "history";
import { bind } from "decko";
import { action } from "mobx";
import { Utilities } from "../../../common";
import { SidebarStore, LoginStore, LiveWebsocket } from "../../store";
import { routes } from "../../routing/routes";

@observer @external
export class AppSidebar extends React.Component {
    @inject private sidebar: SidebarStore;
    @inject private login: LoginStore;
    @inject("history") private history: History;
    @inject private liveWebsocket: LiveWebsocket;
    @inject private utilities: Utilities;

    @bind @action private async handleShutUp() {
        await this.utilities.shutUp();
    }

    public render() {
        return (
            <Sidebar
                as={Menu}
                animation="uncover"
                visible={this.sidebar.visible && this.login.loggedIn}
                vertical
                inverted
            >
                {
                    routes.reduce((result, route) => {
                        if (!route.route.navbar) {
                            return result;
                        }
                        const { title, icon, path } = route.route;
                        result.push(
                            <Menu.Item
                                key={title}
                                name={title}
                                content={title}
                                onClick={() => {
                                    this.history.push(path());
                                    this.sidebar.visibilityToggled = false;
                                }}
                                icon={icon}
                            />,
                        );
                        return result;
                    }, [])
                }
                <Menu.Item
                    name="shut up"
                    content="Shut up"
                    onClick={this.handleShutUp}
                    icon="alarm mute"
                />
                <Menu.Item
                    name="logout"
                    content="Logout"
                    onClick={() => {
                        this.login.logout();
                        this.sidebar.visibilityToggled = false;
                    }}
                    icon="sign out"
                />
                <Menu.Item
                    disabled
                    content={this.liveWebsocket.loading ? "Websocket connecting ..." : "Websocket connected"}
                    icon={this.liveWebsocket.loading ? <Icon loading name="spinner" /> : <Icon name="check" />}
                />
            </Sidebar>
        );
    }
}
