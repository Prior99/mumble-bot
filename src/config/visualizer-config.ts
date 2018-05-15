import { error } from "winston";
import { option, Options } from "clime";
import { pickBy } from "ramda";
import { loadConfigFile } from "./load-config-file";

export class VisualizerConfig extends Options {
    @option({ flag: "c", description: "Path to the configuration file." })
    public configFile: string;

    @option({ description: "Path to the directory to store temporary files in." })
    public tmpDir: string;

    @option({ description: "Path to the directory to store the sounds, visualizations and sounds in." })
    public soundsDir: string;

    @option({ description: "When specified, will scan directories for missing files." })
    public recheck: boolean;

    @option({ description: "When specified, will visualize the cached audio with the given id." })
    public cachedId: string;

    @option({ description: "When specified, will visualize the sound with the given id." })
    public soundId: string;

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
        let actionCount = 0;
        if (this.recheck) { actionCount++; }
        if (this.soundId) { actionCount++; }
        if (this.cachedId) { actionCount++; }
        if (actionCount > 1) {
            error("Can specify only one of: --recheck, --sound-id and --cached-id.");
            okay = false;
        }
        if (actionCount === 0) {
            error("Must specify one of: --recheck, --sound-id and --cached-id.");
            okay = false;
        }
        return okay;
    }
}
