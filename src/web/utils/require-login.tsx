import * as React from "react";
import { Redirect } from "react-router-dom";
import { observer } from "mobx-react";
import { inject, external } from "tsdi";

import { LoginStore } from "../store";
import { routeLogin } from "../routing";

export function requireLogin<P, R extends React.ComponentClass<P | void>>(component: R): R {
    @observer @external
    class RequireLogin extends React.Component<P> {
        @inject("LoginStore") private login: LoginStore;
        public render() {
            if (!this.login.loggedIn) {
                return (
                    <Redirect to={routeLogin.path()} />
                );
            }
            return React.createElement(component as any, this.props);
        }
    }
    return RequireLogin as any;
}
