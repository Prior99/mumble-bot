import * as Winston from "winston";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";
import { Permission } from "../models/permission";

export const permissions = new Map<string, Permission>();

function registerPermission(permission: Permission) {
    permissions.set(permission.id, new Permission(permission));
}

registerPermission({
    id: "login",
    name: "Login",
    description: "Login to the bot.",
    icon: "sign-in"
});

registerPermission({
    id: "grant",
    name: "Grant Permissions",
    description: "Grant permissions to other users.",
    icon: "legal"
});

registerPermission({
    id: "upload-music",
    name: "Upload sounds",
    description: "Upload sounds to the bot.",
    icon: "upload"
});

registerPermission({
    id: "be-quiet",
    name: "Mute bot",
    description: "Mute the bot.",
    icon: "bell-slash"
});

registerPermission({
    id: "log",
    name: "Show Log",
    description: "View the log of the bot.",
    icon: "file-text"
});
