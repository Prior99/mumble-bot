import { inject, component, factory, initialize } from "tsdi";
import { Driver, createConnection, Connection, ConnectionOptions } from "typeorm";
import { info } from "winston";
import * as Yaml from "yamljs";
import { existsSync } from "fs";
import { ServerConfig } from "../config";
import {
    DatabaseSound,
    DatabaseUser,
    DialogPart,
    Dialog,
    Label,
    MumbleLink,
    MumbleUser,
    PermissionAssociation,
    RecordingLabelRelation,
    Recording,
    Setting,
    Token,
} from "../common";

@component
export class Database {
    @inject private serverConfig: ServerConfig;
    public conn: Connection;

    public async connect() {
        const { dbUsername, dbName, dbPassword, dbPort, dbHost, dbDriver, dbLogging } = this.serverConfig;
        info("Connecting to database...");
        this.conn = await createConnection({
            synchronize: true,
            entities: [
                DatabaseSound,
                DatabaseUser,
                DialogPart,
                Dialog,
                Label,
                MumbleLink,
                MumbleUser,
                PermissionAssociation,
                RecordingLabelRelation,
                Recording,
                Setting,
                Token,
            ],
            database: dbName,
            username: dbUsername,
            password: dbPassword,
            port: dbPort,
            host: dbHost,
            type: "postgres",
            logging: dbLogging,
        });
        info("Connected to database.");
    }

    @factory
    public getConnection(): Connection {
        return this.conn;
    }
}
