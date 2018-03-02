import * as React from "react";
import * as ReactDOM from "react-dom";
import DevTools from "mobx-react-devtools";
import { TSDI, component, factory } from "tsdi";
import { History } from "history";
import { Route, Switch, Redirect } from "react-router-dom";
import { Router } from "react-router";
import { configureController, ControllerOptions } from "hyrest";

import { isProductionEnvironment, Users, Tokens, Games, Followerships, Feed } from "../common";
import {
    PageLogin,
    PageDashboard,
    PageSignup,
    PageCreateGame,
    PageGame,
    PageGames,
    PageFollow,
    PageUser,
} from "./pages";
import { AppContainer } from "./components";
import * as routes from "../common-ui/routing";
import "./global.scss";
import { LoginStore, ErrorStore } from "../common-ui";

declare var baseUrl: string;

export const pages = [
    {
        route: routes.routeLogin,
        component: PageLogin,
    },
    {
        route: routes.routeSignup,
        component: PageSignup,
    },
    {
        route: routes.routeDashboard,
        component: PageDashboard,
    },
    {
        route: routes.routeGames,
        component: PageGames,
    },
    {
        route: routes.routeCreateGame,
        component: PageCreateGame,
    },
    {
        route: routes.routeGame,
        component: PageGame,
    },
    {
        route: routes.routeFollow,
        component: PageFollow,
    },
    {
        route: routes.routeUser,
        component: PageUser,
    },
];

const tsdi: TSDI = new TSDI();
tsdi.enableComponentScanner();

function App() {
    return (
        <AppContainer>
            <Switch>
                {
                    tsdi.get(LoginStore).loggedIn ? [
                        <Redirect exact from="/" to={routes.routeDashboard.path()} key="root" />,
                        <Redirect exact from="/login" to={routes.routeDashboard.path()} key="login" />,
                        <Redirect exact from="/signup" to={routes.routeDashboard.path()} key="signup" />,
                    ] : (
                        <Redirect exact from="/" to={routes.routeLogin.path()} />
                    )
                }
                {
                    pages
                        .map((page, index) => (
                            <Route
                                key={index}
                                path={page.route.pattern}
                                component={page.component}
                            />
                        ))
                }
            </Switch>
        </AppContainer>
    );
}

const errors = tsdi.get(ErrorStore);
const controllerOptions: ControllerOptions = {
    baseUrl,
    errorHandler: (err) => errors.report({
        message: err.answer ? err.answer.message : err.message ? err.message : "Unknown error.",
    }),
    authorizationProvider: (headers: Headers) => {
        const loginStore = tsdi.get(LoginStore);
        if (loginStore.loggedIn) {
            headers.append("authorization", `Bearer ${loginStore.authToken}`);
        }
    },
};

configureController([
    Users,
    Tokens,
    Games,
    Followerships,
    Feed,
], controllerOptions);

ReactDOM.render(
    <div>
        <Router history={tsdi.get("history")}><App /></Router>
        {!isProductionEnvironment() && <DevTools position={{ bottom: 0 }} />}
    </div>,
    document.getElementById("root"),
);
