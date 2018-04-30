import { error } from "winston";
import { option, Options } from "clime";
import { pickBy } from "ramda";
import { loadConfigFile } from "./load-config-file";

export class WorkerConfig extends Options {
    @option({ flag: "c", description: "Path to the configuration file.", required: true })
    public configFile: string;

    @option({ description: "Path to the directory to store temporary files in." })
    public tmpDir: string;

    @option({ description: "Path to the directory to store the sounds, visualizations and sounds in." })
    public soundsDir: string;

    public load() {
        Object.assign(
            this,
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
        check(this.tmpDir, "Temp dir not configured. Add 'tmpDir' to config file or specify --tmp-dir");
        check(this.soundsDir, "Sounds dir not configured. Add 'soundsDir' to config file or specify --sounds-dir");
        return okay;
    }
}
