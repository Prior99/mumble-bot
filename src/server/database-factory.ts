import * as uuid from "uuid";
import { component, factory, inject, destroy } from "tsdi";
import { createConnection, Connection } from "typeorm";
import { info, error } from "winston";
import { migrations } from "../migrations";
import { allDatabaseModels } from "../common";
import { ServerConfig } from "../config";

@component
export class DatabaseFactory {
    @inject private config: ServerConfig;

    public conn: Connection;

    public async connect() {
        this.conn = await createConnection({
            name: uuid.v4(),
            entities: allDatabaseModels,
            database: this.config.dbName,
            type: this.config.dbDriver as any,
            logging: this.config.dbLogging,
            password: this.config.dbPassword,
            port: this.config.dbPort,
            username: this.config.dbUsername,
            host: this.config.dbHost,
            extra: { ssl: this.config.dbSSL },
            migrations,
        });
        info("Connected to database.");
    }

    @factory({ name: "db" })
    public getConnection(): Connection { return this.conn; }

    @destroy
    public async stop() {
        if (this.conn && this.conn.isConnected) {
            try {
                await this.conn.close();
            } catch (err) {
                error(`Error occured when closing databsae connection: ${err.message}`);
            }
            info("Disconnected from database.");
        }
    }
}
