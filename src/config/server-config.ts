import { option, Options } from "clime";
import { readFileSync } from "fs";
import { error } from "winston";

import { loadConfigFile } from "./load-config-file";

export class ServerConfig extends Options {
    @option({ flag: "p", description: "Port to host the API on." })
    public port: number;

    @option({ flag: "u", description: "Url of the mumble server to connect to." })
    public url: string;

    @option({ flag: "c", description: "Path to the configuration file." })
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
        let okay = true;

        const check = (value: string | number | boolean, message: string) => {
            if (value === undefined) {
                error(message);
                okay = false;
            }
        };

        if (this.port === undefined)  { this.port = file.port || 23278; }
        if (this.url === undefined)  {
            this.url = file.url;
            check(this.url, "Mumble url not configured. Add 'url' to config file or specify --url.");
        }
        if (this.configFile === undefined) { this.configFile = file.configFile; }
        if (this.audioCacheAmount === undefined) { this.audioCacheAmount = file.audioCacheAmount || 100; }
        if (this.dbName === undefined) {
            this.dbName = file.dbName;
            check(this.dbName, "Database name not configured. Add 'dbName' to config file or specify --db-name.");
        }
        if (this.dbUsername === undefined) {
            this.dbUsername = file.dbUsername;
            check(
                this.dbUsername,
                "Database user not configured. Add 'dbUsername' to config file or specify --db-username."
            );
        }
        if (this.dbPassword === undefined) { this.dbPassword = file.dbPassword; }
        if (this.dbPort === undefined) { this.dbPort = file.dbPort || 5432; }
        if (this.dbHost === undefined) { this.dbHost = file.dbHost || "localhost"; }
        if (this.dbDriver === undefined) { this.dbDriver = file.dbDriver || "postgres"; }
        if (this.dbLogging === undefined) { this.dbLogging = file.dbLogging || false; }
        if (this.key === undefined) { this.key = file.key; }
        if (this.cert === undefined) { this.cert = file.cert; }
        if (this.name === undefined) {
            this.name = file.name;
            check(this.name, "Name not configured. Add 'name' to config file or specify --name");
        }
        if (this.mumblePassword === undefined) { this.mumblePassword = file.mumblePassword; }
        if (this.tmpDir === undefined) {
            this.tmpDir = file.tmpDir;
            check(this.tmpDir, "Temp dir not configured. Add 'tmpDir' to config file or specify --tmp-dir");
        }
        if (this.recordingsDir === undefined) {
            this.recordingsDir = file.recordingsDir;
            check(
                this.name,
                "Recordings dir not configured. Add 'recordingsDir' to config file or specify --recordings-dir"
            );
        }
        if (this.visualizationsDir === undefined) {
            this.visualizationsDir = file.visualizationsDir;
            check(
                this.visualizationsDir,
                "Visualizations dir not configured. Add 'visualizationsDir' to config file or specify --visualizations-dir" // tslint:disable-line
            );
        }
        if (this.uploadDir === undefined) {
            this.uploadDir = file.uploadDir;
            check(this.uploadDir, "Upload dir not configured. Add 'uploadDir' to config file or specify --upload-dir");
        }
        return okay;
    }

    public get keyContent() {
        if (!this.key) { return; }
        try {
            return readFileSync(this.key, "utf8");
        } catch (err) {
            error(`Could not open SSL key file "${this.key}"`);
        }
    }

    public get certContent() {
        if (!this.cert) { return; }
        try {
            return readFileSync(this.cert, "utf8");
        } catch (err) {
            error(`Could not open SSL cert file "${this.cert}"`);
        }
    }
}
