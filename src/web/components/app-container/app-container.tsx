import * as React from "react";
import { observer } from "mobx-react";
import { Sidebar, Dimmer, Loader } from "semantic-ui-react";
import * as classNames from "classnames/bind";
import { inject, external } from "tsdi";
import { SidebarStore, LoginStore, UsersStore } from "../../store";
import { Errors } from "../errors";
import { AppBar } from "../app-bar";
import { AppSidebar } from "../sidebar";
import { QuickList } from "../quick-list";
import * as css from "./app-container.scss";
import { isProductionEnvironment } from "../../../common";

declare var SOFTWARE_VERSION: string;

const cx = classNames.bind(css);

@observer @external
export class AppContainer extends React.Component<{}, undefined> {
    @inject private sidebar: SidebarStore;
    @inject private login: LoginStore;
    @inject private users: UsersStore;

    public render() {
        const pageClasses = cx({
            pageSidebarActive: this.sidebar.alwaysOpen && this.login.loggedIn,
        });
        if (this.login.loggedIn && this.users.loading) {
            return (
                <Dimmer active>
                    <Loader />
                </Dimmer>
            );
        }
        return (
            <div>
                { this.login.loggedIn && <QuickList /> }
                <Errors />
                <Sidebar.Pushable className={css.content}>
                    <AppSidebar />
                    <Sidebar.Pusher className={pageClasses}>
                        <AppBar />
                        <div className={css.container}>
                            {this.props.children}
                        </div>
                        {
                            isProductionEnvironment() && (
                                <div className={css.version}>{SOFTWARE_VERSION}</div>
                            )
                        }
                    </Sidebar.Pusher>
                </Sidebar.Pushable>
            </div>
        );
    }
}
