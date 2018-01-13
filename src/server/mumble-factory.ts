import { component, factory, initialize, inject } from "tsdi";
import { Connection, connect } from "mumble";
import { info, error, warn } from "winston";

import { ServerConfig } from "../config";

@component
export class MumbleFactory {
    @inject private config: ServerConfig;

    public conn: Connection;

    public async connect() {
        info("Connecting to mumble...");
        const { keyContent, certContent, url, name, mumblePassword} = this.config;
        if (!keyContent || !certContent) {
            warn("Connecting without certificate. Connection will be unsecured, bot will not be able to register!");
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
}
