import { Options, option } from "clime";

export class MigrationConfig extends Options {
    @option({ required: true, description: "Name of the target 1.0.0 database to use." })
    public targetDbName: string;

    @option({ description: "Username to use to connect to the target 1.0.0 database" })
    public targetDbUsername: string;

    @option({
        description: "Password to use to connect to the target 1.0.0 database.",
        default: "",
    })
    public targetDbPassword: string;

    @option({ description: "Port the target 1.0.0 database runs on." })
    public targetDbPort: number;

    @option({
        description: "Hostname of the server hosting the target 1.0.0 database.",
        default: "localhost",
    })
    public targetDbHost: string;

    @option({
        description: "Drive of the target 1.0.0 database.",
        default: "postgres",
    })
    public targetDbDriver: string;

    @option({ description: "Whether SSL should be used to connect to the target database." })
    public targetDbSSL: boolean;

    @option({ required: true, description: "Path to the directory to store the migrated sounds in." })
    public targetSoundsDir: string;

    @option({ required: true, description: "Name of the source 0.2.1 database to use." })
    public sourceDbName: string;

    @option({ required: true, description: "Username to use to connect to the source 0.2.1 database" })
    public sourceDbUsername: string;

    @option({
        description: "Password to use to connect to the source 0.2.1 database.",
        default: "",
    })
    public sourceDbPassword: string;

    @option({ description: "Port the source 0.2.1 database runs on." })
    public sourceDbPort: number;

    @option({ description: "Socket path to use to connect to the source 0.2.1 database" })
    public sourceDbSocketPath: string;

    @option({
        description: "Hostname of the server hosting the source 0.2.1 database.",
        default: "localhost",
    })
    public sourceDbHost: string;

    @option({
        required: true,
        description: "Path to the directory to read the recordings sounds from.",
        default: "",
    })
    public sourceRecordingsDir: string;

    @option({ required: true, description: "Path to the directory to read the source uploads from." })
    public sourceUploadsDir: string;
}
