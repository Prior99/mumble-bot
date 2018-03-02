import { component, factory, initialize } from "tsdi";
import { connect } from "mumble";
import { info } from "winston";
import * as Yaml from "yamljs";
import { existsSync } from "fs";

function envConfig() {
    const result: any = {};
    if (!process || !process.env) { return result; }
    const {
        MUMBLE_BOT_KEY_FILE,
        MUMBLE_BOT_CERT_FILE,
        MUMBLE_BOT_DB_PASSWORD,
        MUMBLE_BOT_DB_PORT,
        MUMBLE_BOT_DB_HOST,
        MUMBLE_BOT_DB_LOGGING,
        MUMBLE_BOT_DB_DRIVER
    } = process.env;
    if (MUMBLE_BOT_DB_DATABASE) { result.database = MUMBLE_BOT_DB_DATABASE; }
    if (MUMBLE_BOT_DB_USER) { result.username = MUMBLE_BOT_DB_USER; }
    if (MUMBLE_BOT_DB_PASSWORD) { result.password = MUMBLE_BOT_DB_PASSWORD; }
    if (MUMBLE_BOT_DB_PORT) { result.port = MUMBLE_BOT_DB_PORT; }
    if (MUMBLE_BOT_DB_HOST) { result.host = MUMBLE_BOT_DB_HOST; }
    if (MUMBLE_BOT_DB_DRIVER) { result.type = MUMBLE_BOT_DB_DRIVER; }
    if (MUMBLE_BOT_DB_LOGGING) { result.logging = MUMBLE_BOT_DB_LOGGING === "true"; }
    return result;
}

@component
export class Database {
    public conn: Connection;

    public async connect() {
        info("Connecting to database...");
        this.conn = await createConnection({
            synchronize: true,
            entities: [
                DatabaseSound,
                DatabaseUser,
                DialogPart,
                Dialog,
                Label,
                LogEntry,
                MumbleLink,
                MumbleUser,
                PermissionAssociation,
                RecordLabelRelation,
                Recording,
                Setting,
                Token
            ],
            ...(existsSync("./database.yml") ? Yaml.load("./database.yml") : {}),
            ...envConfig()
        });
        info("Connected to database.");
    }

    @factory
    public getConnection(): Connection {
        return this.conn;
    }
}

