import * as React from "react";
import { Sidebar, Menu } from "semantic-ui-react";
import { observer } from "mobx-react";
import { inject, external } from "tsdi";
import { History } from "history";

import { routes, SidebarStore, LoginStore } from "../../../common-ui";

@observer @external
export class AppSidebar extends React.Component {
    @inject private sidebar: SidebarStore;
    @inject private login: LoginStore;
    @inject private history: History;

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
                        if (!route.navbar) {
                            return result;
                        }
                        const { title, icon, path } = route;
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
                    name="logout"
                    content="Logout"
                    onClick={() => {
                        this.login.logout();
                        this.sidebar.visibilityToggled = false;
                    }}
                    icon={"sign out"}
                />
            </Sidebar>
        );
    }
}
