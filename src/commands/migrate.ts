import { metadata, command, Command } from "clime";
import { Connection } from "typeorm";
import { info, error } from "winston";
import { ServerConfig, ServerConfigFactory } from "../config";
import { setupWinston } from "../common";
import { DatabaseFactory } from "../server";
import { TSDI } from "tsdi";

setupWinston();
@command({ description: "Perform necessary database migrations" })
export default class MigrateCommand extends Command { // tslint:disable-line
    @metadata
    public async execute(config: ServerConfig) {
        if (!config.load()) { return; }
        // Always log queries when running migrations.
        config.dbLogging = true;
        const tsdi = new TSDI();
        tsdi.enableComponentScanner();
        // Initialize config.
        tsdi.get(ServerConfigFactory).setConfig(config);
        // Initialize database.
        await tsdi.get(DatabaseFactory).connect();
        const db = tsdi.get(Connection);
        // Execute migrations.
        await db.runMigrations();
        tsdi.close();
    }
}
