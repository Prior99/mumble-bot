import * as React from "react";
import * as ReactDOM from "react-dom";
import DevTools from "mobx-react-devtools";
import { TSDI } from "tsdi";
import "./factories";
import { Route, Switch, Redirect } from "react-router-dom";
import { Router } from "react-router";
import { configureController, ControllerOptions } from "hyrest";
import { isProductionEnvironment, allControllers } from "../common";
import { AppContainer } from "./components";
import { routeDashboard, routeLogin } from "./routing";
import { routes } from "./routing/routes";
import "./global.scss";
import { LoginStore, ErrorStore } from "./store";

declare var baseUrl: string;

const tsdi: TSDI = new TSDI();
tsdi.enableComponentScanner();

function App() {
    return (
        <AppContainer>
            <Switch>
                {
                    tsdi.get(LoginStore).loggedIn ? [
                        <Redirect exact from="/" to={routeDashboard.path()} key="root" />,
                        <Redirect exact from="/login" to={routeDashboard.path()} key="login" />,
                        <Redirect exact from="/signup" to={routeDashboard.path()} key="signup" />,
                    ] : (
                        <Redirect exact from="/" to={routeLogin.path()} />
                    )
                }
                {
                    routes
                        .map((route, index) => (
                            <Route
                                key={index}
                                path={route.route.pattern}
                                component={route.component}
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
    errorHandler: err => {
        errors.report({
            message: err.answer ? err.answer.message : err.message ? err.message : "Unknown error.",
        });
        if (err.statusCode === 401) {
            tsdi.get(LoginStore).logout();
        }
    },
    authorizationProvider: (headers: Headers) => {
        const loginStore = tsdi.get(LoginStore);
        if (loginStore.loggedIn) {
            headers.append("authorization", `Bearer ${loginStore.authToken}`);
        }
    },
};

configureController(allControllers, controllerOptions);

ReactDOM.render(
    <div>
        <Router history={tsdi.get("history")}><App /></Router>
        {!isProductionEnvironment() && <DevTools position={{ bottom: 0 }} />}
    </div>,
    document.getElementById("root"),
);
