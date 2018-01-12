import { component, factory, initialize, inject } from "tsdi";
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
import { ServerConfig } from "../config";

@component
export class Database {
    @inject private config: ServerConfig;

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
            database: this.config.dbName,
            type: this.config.dbDriver as any,
            logging: this.config.dbLogging,
            password: this.config.dbPassword,
            port: this.config.dbPort,
            username: this.config.dbUsername,
            host: this.config.dbHost
        });
        info("Connected to database.");
    }

    @factory
    public getConnection(): Connection { return this.conn; }
}
