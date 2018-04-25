import { option, Options } from "clime";
import { readFileSync } from "fs";
import { error } from "winston";
import { pickBy } from "ramda";

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
    public dbPort: number;

    @option({ description: "Hostname of the server hosting the database." })
    public dbHost: string;

    @option({ description: "Drive of the database. Defaults to \"postgres\"" })
    public dbDriver: string;

    @option({ description: "Whether to log all SQL queries executed." })
    public dbLogging: boolean;

    @option({ name: "mumbleKeyFile", description: "Path to the SSL key file used to connect to mumble." })
    public keyFile: string;

    @option({ name: "mumbleCertFile", description: "Path to the SSL certificate file used to connect to mumble." })
    public certFile: string;

    @option({ name: "mumbleKey", description: "SSL key used to connect to mumble." })
    public key: string;

    @option({ name: "mumbleCert", description: "SSL certificate used to connect to mumble." })
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
        Object.assign(
            this,
            {
                port: 23278,
                audioCacheAmount: 100,
                dbPort: 5432,
                dbHost: "localhost",
                dbDriver: "postgres",
                dbLogging: false,
            },
            pickBy(val => val !== undefined, loadConfigFile(this.configFile)),
            pickBy(val => val !== undefined, this),
        );

        let okay = true;
        const check = (value: string | number | boolean, message: string) => {
            if (value === undefined) {
                error(message);
                okay = false;
            }
        };
        check(this.url, "Mumble url not configured. Add 'url' to config file or specify --url.");
        check(this.dbName, "Database name not configured. Add 'dbName' to config file or specify --db-name.");
        check(this.name, "Name not configured. Add 'name' to config file or specify --name");
        check(this.tmpDir, "Temp dir not configured. Add 'tmpDir' to config file or specify --tmp-dir");
        check(
            this.name,
            "Recordings dir not configured. Add 'recordingsDir' to config file or specify --recordings-dir",
        );
        check(
            this.visualizationsDir,
            "Visualizations dir not configured. Add 'visualizationsDir' to config file or specify --visualizations-dir",
        );
        check(this.uploadDir, "Upload dir not configured. Add 'uploadDir' to config file or specify --upload-dir");
        return okay;
    }

    public get keyContent() {
        if (!this.keyFile) {
            if (this.key) { return this.key; }
            return;
        }
        try {
            return readFileSync(this.keyFile, "utf8");
        } catch (err) {
            error(`Could not open SSL key file "${this.keyFile}"`);
        }
    }

    public get certContent() {
        if (!this.certFile) {
            if (this.cert) { return this.cert; }
            return;
        }
        try {
            return readFileSync(this.certFile, "utf8");
        } catch (err) {
            error(`Could not open SSL cert file "${this.certFile}"`);
        }
    }
}
