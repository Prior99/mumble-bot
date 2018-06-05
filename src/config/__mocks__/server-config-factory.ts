import { component, factory } from "tsdi";
import * as path from "path";
import { ServerConfig } from "..";
import * as uuid from "uuid";

@component
export class ServerConfigFactory {
    private config: ServerConfig;

    constructor() {
        this.config = new ServerConfig();
        const baseTmpDir = path.join("/", "tmp", `bot-${uuid.v4()}`);
        Object.assign(this.config, {
            port: 23279,
            url: "localhost",
            audioCacheAmount: 100,
            dbName: process.env["POSTGRES_DB"] || "bot-test",
            dbUsername: process.env["POSTGRES_USER"],
            dbPassword: process.env["POSTGRES_PASSWORD"],
            dbHost: process.env["POSTGRES_HOST"] || "localhost",
            dbLogging: Boolean(process.env["DEBUG"]),
            tmpDir: path.join(baseTmpDir, "tmp"),
            soundsDir: path.join(baseTmpDir, "sound"),
            name: "test-bot",
        });
        this.config.load();
    }

    @factory
    public getConfig(): ServerConfig { return this.config; }
}
