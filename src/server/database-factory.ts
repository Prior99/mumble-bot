import { component, factory, inject, destroy } from "tsdi";
import { createConnection, Connection } from "typeorm";
import { info } from "winston";

import { allDatabaseModels } from "../common";
import { ServerConfig } from "../config";

@component
export class DatabaseFactory {
    @inject private config: ServerConfig;

    public conn: Connection;

    public async connect(dropSchema = false) {
        this.conn = await createConnection({
            entities: allDatabaseModels,
            database: this.config.dbName,
            type: this.config.dbDriver as any,
            logging: this.config.dbLogging,
            password: this.config.dbPassword,
            port: this.config.dbPort,
            username: this.config.dbUsername,
            host: this.config.dbHost,
            dropSchema,
            extra: { ssl: this.config.dbSSL },
            migrations: [`${__dirname}/../migrations/*`],
        });
        info("Connected to database.");
    }

    @factory
    public getConnection(): Connection { return this.conn; }

    @destroy
    public async stop() {
        if (this.conn) {
            await this.conn.close();
            info("Disconnected from database.");
        }
    }
}
