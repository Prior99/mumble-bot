import * as React from "react";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { observable } from "mobx";
import { bind } from "decko";

import { requireLogin, LoginStore } from "../../../common-ui";
import { Content } from "../../components";

@requireLogin @observer @external
export class PageDashboard extends React.Component {
    @inject private login: LoginStore;

    public render() {
        return (
            <Content>
                <h1>Dashboard</h1>
            </Content>
        );
    }
}
