import { component, factory, initialize } from "tsdi";
import { createConnection, Connection, ConnectionOptions } from "typeorm";
import { info } from "winston";
import * as Yaml from "yamljs";
import { existsSync } from "fs";

import {
    CachedAudio,
    DatabaseSound,
    DatabaseUser,
    DialogPart,
    Dialog,
    Label,
    LogEntry,
    MumbleLink,
    MumbleUser,
    PermissionAssociation,
    RecordingLabelRelation,
    Recording,
    Setting,
    Token
} from "../common";

function envConfig() {
    const result: any = {};
    if (!process || !process.env) {
        return result;
    }
    const {
        BOT_DB_DATABASE,
        BOT_DB_USER,
        BOT_DB_PASSWORD,
        BOT_DB_PORT,
        BOT_DB_HOST,
        BOT_DB_LOGGING,
        BOT_DB_DRIVER
    } = process.env;
    if (BOT_DB_DATABASE) { result.database = BOT_DB_DATABASE; }
    if (BOT_DB_USER) { result.username = BOT_DB_USER; }
    if (BOT_DB_PASSWORD) { result.password = BOT_DB_PASSWORD; }
    if (BOT_DB_PORT) { result.port = BOT_DB_PORT; }
    if (BOT_DB_HOST) { result.host = BOT_DB_HOST; }
    if (BOT_DB_DRIVER) { result.type = BOT_DB_DRIVER; }
    if (BOT_DB_LOGGING) { result.logging = BOT_DB_LOGGING === "true"; }
    return result;
}

@component
export class Database {
    public conn: Connection;

    public async connect() {
        info("Connecting to database...");
        this.conn = await createConnection({
            synchronize: true,
            entities: [
                CachedAudio,
                DatabaseSound,
                DatabaseUser,
                DialogPart,
                Dialog,
                Label,
                LogEntry,
                MumbleLink,
                MumbleUser,
                PermissionAssociation,
                RecordingLabelRelation,
                Recording,
                Setting,
                Token
            ],
            ...(existsSync("./bot.yml") ? Yaml.load("./database.yml").database : {}),
            ...envConfig()
        });
        info("Connected to database.");
    }

    @factory
    public getConnection(): Connection { return this.conn; }
}
