import { component, factory, initialize, inject, destroy } from "tsdi";
import { Connection, connect } from "mumble";
import { info, error, warn } from "winston";

import { ServerConfig } from "../config";

@component
export class MumbleFactory {
    @inject private config: ServerConfig;

    public conn: Connection;

    public async connect() {
        const { keyContent, certContent, url, name, mumblePassword} = this.config;
        if (!keyContent || !certContent) {
            warn("Connecting to mumble without SSL. Connection will be unsecured, bot will not be able to register!");
        }
        this.conn = await new Promise<Connection>((resolve, reject) => {
            connect(`mumble://${url}`, { key: keyContent, cert: certContent }, (err, connection) => {
                if (err) { return reject(err); }
                connection.on("error", (data) => error("An error with the mumble connection has occured:", data));
                connection.authenticate(name, mumblePassword);
                connection.on("ready", () => resolve(connection));
            });
        });
        info("Connected to mumble.");
    }

    @factory
    public getConnection(): Connection { return this.conn; }

    @destroy
    public stop(): Promise<undefined> {
        return new Promise(resolve => {
            if (!this.conn) { return; }
            this.conn.on("disconnect", () => {
                info("Disconnected from mumble.");
                resolve();
            });
            this.conn.disconnect();
        });
    }
}
