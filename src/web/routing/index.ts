export interface BasicRoute {
    path: (...args: string[]) => string;
    pattern: string;
}

export interface UnauthorizedRoute extends BasicRoute {
    unauthorized: true;
    navbar?: false;
}

export interface AuthorizedRoute extends BasicRoute {
    unauthorized?: false;
    navbar?: false;
}

export interface AuthorizedNavbarRoute extends BasicRoute {
    unauthorized?: false;
    navbar: true;
    icon: string;
    title: string;
}

export type Route = AuthorizedRoute | AuthorizedNavbarRoute | UnauthorizedRoute;

export const routeLogin: Route = {
    path: () => "/login",
    pattern: "/login",
    unauthorized: true,
};

export const routeSignup: Route = {
    path: () => "/signup",
    pattern: "/signup",
    unauthorized: true,
};

export const routeDashboard: Route = {
    path: () => "/dashboard",
    pattern: "/dashboard",
    navbar: true,
    title: "Dashboard",
    icon: "dashboard",
};

export const routeUser: Route = {
    path: (id: string) => `/user/${id}`,
    pattern: "/user/:id",
};

export const routeFork: Route = {
    path: (id: string) => `/sound/${id}/fork`,
    pattern: "/sound/:id/fork",
};

export const routeSound: Route = {
    path: (id: string) => `/sound/${id}`,
    pattern: "/sound/:id",
};

export const routeSettings: Route = {
    path: () => "/settings",
    pattern: "/settings",
    navbar: true,
    title: "Settings",
    icon: "settings",
};

export const routeUsers: Route = {
    path: () => "/users",
    pattern: "/users",
    navbar: true,
    title: "Users",
    icon: "group",
};

export const routeSounds: Route = {
    path: () => "/sounds",
    pattern: "/sounds",
    navbar: true,
    title: "Sounds",
    icon: "music",
};

export const routeCached: Route = {
    path: () => "/cached",
    pattern: "/cached",
    navbar: true,
    title: "Cached Audios",
    icon: "history",
};

export const routePlaylists: Route = {
    path: () => "/playlists",
    pattern: "/playlists",
    navbar: true,
    title: "Playlists",
    icon: "list",
};

export const routeUpload: Route = {
    path: () => "/upload",
    pattern: "/upload",
    navbar: true,
    title: "Upload",
    icon: "upload",
};

export const routeYoutube: Route = {
    path: () => "/youtube",
    pattern: "/youtube",
    navbar: true,
    title: "YouTube",
    icon: "youtube play",
};
