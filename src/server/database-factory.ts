import { component, factory, initialize, inject, destroy } from "tsdi";
import { createConnection, Connection, ConnectionOptions } from "typeorm";
import { info } from "winston";

import {
    CachedAudio,
    DatabaseSound,
    User,
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
import { ServerConfig } from "../config";

@component
export class DatabaseFactory {
    @inject private config: ServerConfig;

    public conn: Connection;

    public async connect(dropSchema = false) {
        this.conn = await createConnection({
            synchronize: true,
            entities: [
                CachedAudio,
                DatabaseSound,
                User,
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
            database: this.config.dbName,
            type: this.config.dbDriver as any,
            logging: this.config.dbLogging,
            password: this.config.dbPassword,
            port: this.config.dbPort,
            username: this.config.dbUsername,
            host: this.config.dbHost,
            dropSchema,
        });
        info("Connected to database.");
    }

    @factory
    public getConnection(): Connection { return this.conn; }

    @destroy
    public async stop() {
        await this.conn.close();
        info("Disconnected from database.");
    }
}
