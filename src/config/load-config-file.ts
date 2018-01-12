import * as Yaml from "yamljs";
import { error, warn } from "winston";

export function loadConfigFile(filename: string): any {
    if (!filename) {
        warn("No config file set.");
    }
    try {
        const file = Yaml.load(filename);
        return file;
    } catch (err) {
        error(`Unable to load config file "${filename}".`);
    }
}
