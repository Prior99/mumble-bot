import { inject, component, factory, initialize } from "tsdi";
import { connect, Connection } from "mumble";
import { info } from "winston";
import * as Yaml from "yamljs";
import { existsSync } from "fs";
import { ServerConfig } from "../config";

@component
export class Database {
    @inject private serverConfig: ServerConfig;

    public conn: Connection;

    public async connect() {
        info("Connecting to mumble...");
        const { url, keyContent: key, certContent: cert } = this.serverConfig;
        this.conn = await new Promise<Connection>((resolve, reject) => {
            connect(url, { key, cert }, (error: Error, connection: Connection) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(connection);
            });
        });
        info("Connected to mumble.");
    }

    @factory
    public getConnection(): Connection {
        return this.conn;
    }
}
