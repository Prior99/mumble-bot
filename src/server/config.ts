import { component, factory, initialize } from "tsdi";
import { info } from "winston";
import { existsSync } from "fs";





@component
export class Config extends Options {
    public database: DatabaseConfig;
    public mumble: MumbleConfig;
    public paths: PathsConfig;
    public website: WebsiteConfig;

    @initialize
    public initialize() {
        if (existsSync(`${__dirname}/../../bot.yml`)) {
            
        }
        if (process && process.env) {
            const {
                BOT_DB_DATABASE,
                BOT_DB_USER,
                BOT_DB_PASSWORD,
                BOT_DB_PORT,
                BOT_DB_HOST,
                BOT_DB_LOGGING,
                BOT_DB_DRIVER
            } = process.env;
            if (BOT_DB_DATABASE) { this.database.database = BOT_DB_DATABASE; }
            if (BOT_DB_USER) { this.database.username = BOT_DB_USER; }
            if (BOT_DB_PASSWORD) { this.database.password = BOT_DB_PASSWORD; }
            if (BOT_DB_PORT) { this.database.port = BOT_DB_PORT; }
            if (BOT_DB_HOST) { this.database.host = BOT_DB_HOST; }
            if (BOT_DB_DRIVER) { this.database.type = BOT_DB_DRIVER; }
            if (BOT_DB_LOGGING) { this.database.logging = BOT_DB_LOGGING === "true"; }
        }
    }
}
