import { option, Options } from "clime";

export class DatabaseConfig extends Options {
    @option({ name: "dbName", description: "Name of the database to use." })
    public database: string;

    @option({ name: "dbName", description: "Username to use to connect to the database" })
    public username: string;

    @option({ name: "dbName", description: "Password to use to connect to the database." })
    public password: string;

    @option({ name: "dbName", description: "Port the database runs on." })
    public port: string;

    @option({ name: "dbName", description: "Hostname of the server hosting the database." })
    public host: string;

    @option({ name: "dbName", description: "Drive of the database. Defaults to \"postgres\"" })
    public type: string;

    @option({ name: "dbLogging", description: "Whether to log all SQL queries executed." })
    public logging: boolean;
}
