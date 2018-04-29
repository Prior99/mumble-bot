import {
    PageLogin,
    PageDashboard,
    PageSignup,
    PageUser,
    PageSettings,
    PageUsers,
} from "../pages";
import {
    routeLogin,
    routeDashboard,
    routeSignup,
    routeUser,
    routeSettings,
    routeUsers,
} from ".";

export const routes = [
    {
        component: PageLogin,
        route: routeLogin,
    }, {
        component: PageDashboard,
        route: routeDashboard,
    }, {
        component: PageSignup,
        route: routeSignup,
    }, {
        component: PageUser,
        route: routeUser,
    }, {
        component: PageSettings,
        route: routeSettings,
    }, {
        component: PageUsers,
        route: routeUsers,
    },
];
