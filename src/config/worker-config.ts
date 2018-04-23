import { option, Options } from "clime";
import { loadConfigFile } from "./load-config-file";

export class WorkerConfig extends Options {
    @option({ flag: "c", description: "Path to the configuration file.", required: true })
    public configFile: string;

    @option({ description: "Path to the directory to store temporary files in." })
    public tmpDir: string;

    public load() {
        const file = loadConfigFile(this.configFile);
        if (this.configFile === undefined) { this.configFile = file.configFile; }
        if (this.tmpDir === undefined) { this.tmpDir = file.tmpDir; }
    }
}
