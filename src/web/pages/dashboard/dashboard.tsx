import * as React from "react";
import { external } from "tsdi";
import { observer } from "mobx-react";

import { requireLogin } from "../../../common-ui";
import { Content } from "../../components";

@requireLogin @observer @external
export class PageDashboard extends React.Component {
    public render() {
        return (
            <Content>
                <h1>Dashboard</h1>
            </Content>
        );
    }
}
