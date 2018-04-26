import * as React from "react";
import { observer } from "mobx-react";
import { Sidebar } from "semantic-ui-react";
import * as classNames from "classnames/bind";
import { inject, external } from "tsdi";
import { SidebarStore, LoginStore } from "../../../common-ui";
import { Errors, AppBar, AppSidebar  } from "..";
import * as css from "./app-container.scss";

declare var SOFTWARE_VERSION: string;

const cx = classNames.bind(css);

@observer @external
export class AppContainer extends React.Component<{}, undefined> {
    @inject private sidebar: SidebarStore;
    @inject private login: LoginStore;

    public render() {
        const pageClasses = cx({
            pageSidebarActive: this.sidebar.alwaysOpen && this.login.loggedIn,
        });

        return (
            <div>
                <Errors />
                <Sidebar.Pushable className={css.content}>
                    <AppSidebar />
                    <Sidebar.Pusher className={pageClasses}>
                        <AppBar />
                        <div className={css.container}>
                            {this.props.children}
                        </div>
                        <div className={css.version}>{SOFTWARE_VERSION}</div>
                    </Sidebar.Pusher>
                </Sidebar.Pushable>
            </div>
        );
    }
}
