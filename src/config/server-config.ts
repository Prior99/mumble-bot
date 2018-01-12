import { option, Options } from "clime";
import { loadConfigFile } from "./load-config-file";

export class ServerConfig extends Options {
    @option({ flag: "p", description: "Port to host the API on." })
    public port: number;

    @option({ flag: "u", description: "Public Url on which the API will be reachable" })
    public url: string;

    @option({ flag: "c", description: "Path to the configuration file.", required: true })
    public configFile: string;

    @option({ description: "Amount of cached recordings to keep." })
    public audioCacheAmount: number;

    @option({ description: "Name of the database to use." })
    public dbName: string;

    @option({ description: "Username to use to connect to the database" })
    public dbUsername: string;

    @option({ description: "Password to use to connect to the database." })
    public dbPassword: string;

    @option({ description: "Port the database runs on." })
    public dbPort: string;

    @option({ description: "Hostname of the server hosting the database." })
    public dbHost: string;

    @option({ description: "Drive of the database. Defaults to \"postgres\"" })
    public dbDriver: string;

    @option({ description: "Whether to log all SQL queries executed." })
    public dbLogging: boolean;

    @option({ name: "mumbleKeyFile", description: "Path to the SSL key file used to connect to mumble." })
    public key: string;

    @option({ name: "mumbleCertFile", description: "Path to the SSL certificate file used to connect to mumble." })
    public cert: string;

    @option({ flag: "n", description: "Name of the bot in Mumble." })
    public name: string;

    @option({ flag: "P", description: "Password used to connect to Mumble. "})
    public mumblePassword: string;

    @option({ description: "Path to the directory to store temporary files in." })
    public tmpDir: string;

    @option({ description: "Path to the directory to store the recordings in." })
    public recordingsDir: string;

    @option({ description: "Path to the directory to store the visualizations in." })
    public visualizationsDir: string;

    @option({ description: "Path to the directory to store the uploaded sounds in." })
    public uploadDir: string;

    public load() {
        const file = loadConfigFile(this.configFile);
        if (this.port === undefined)  { this.port = file.port; }
        if (this.url === undefined)  { this.url = file.url; }
        if (this.configFile === undefined) { this.configFile = file.configFile; }
        if (this.audioCacheAmount === undefined) { this.audioCacheAmount = file.audioCacheAmount; }
        if (this.dbName === undefined) { this.dbName = file.dbName; }
        if (this.dbUsername === undefined) { this.dbUsername = file.dbUsername; }
        if (this.dbPassword === undefined) { this.dbPassword = file.dbPassword; }
        if (this.dbPort === undefined) { this.dbPort = file.dbPort; }
        if (this.dbHost === undefined) { this.dbHost = file.dbHost; }
        if (this.dbDriver === undefined) { this.dbDriver = file.dbDriver; }
        if (this.dbLogging === undefined) { this.dbLogging = file.dbLogging; }
        if (this.key === undefined) { this.key = file.key; }
        if (this.cert === undefined) { this.cert = file.cert; }
        if (this.name === undefined) { this.name = file.name; }
        if (this.mumblePassword === undefined) { this.mumblePassword = file.mumblePassword; }
        if (this.tmpDir === undefined) { this.tmpDir = file.tmpDir; }
        if (this.recordingsDir === undefined) { this.recordingsDir = file.recordingsDir; }
        if (this.visualizationsDir === undefined) { this.visualizationsDir = file.visualizationsDir; }
        if (this.uploadDir === undefined) { this.uploadDir = file.uploadDir; }
    }
}
