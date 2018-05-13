import {
    PageLogin,
    PageDashboard,
    PageSignup,
    PageUser,
    PageSettings,
    PageUsers,
    PageSounds,
    PageCached,
    PagePlaylists,
    PageUpload,
    PageYoutube,
    PageSound,
    PageFork,
} from "../pages";
import {
    routeLogin,
    routeDashboard,
    routeSignup,
    routeUser,
    routeSettings,
    routeUsers,
    routeSounds,
    routeCached,
    routePlaylists,
    routeUpload,
    routeYoutube,
    routeSound,
    routeFork,
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
    }, {
        component: PageSounds,
        route: routeSounds,
    }, {
        component: PageCached,
        route: routeCached,
    }, {
        component: PagePlaylists,
        route: routePlaylists,
    }, {
        component: PageUpload,
        route: routeUpload,
    }, {
        component: PageYoutube,
        route: routeYoutube,
    }, {
        component: PageFork,
        route: routeFork,
    }, {
        component: PageSound,
        route: routeSound,
    },
];
