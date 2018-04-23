import * as React from "react";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { observable } from "mobx";
import { bind } from "decko";
import { Menu } from "semantic-ui-react";

import { requireLogin, LoginStore } from "../../../common-ui";
import { Content } from "../../components";
import * as css from "./dashboard.scss";

@requireLogin @observer @external
export class PageDashboard extends React.Component {
    @inject private login: LoginStore;

    public render() {
        return (
            <Content>
                <div className={css.container}>
                    <div className={css.feed}>
                        <Menu tabular>
                        </Menu>
                    </div>
                    <div className={css.side}>
                    </div>
                </div>
            </Content>
        );
    }
}
