import * as Yaml from "yamljs";
import { error, warn } from "winston";

export function loadConfigFile(filename: string): any {
    if (!filename) {
        warn("No config file set.");
        return {};
    }
    try {
        const file = Yaml.load(filename);
        console.log(file);
        return file;
    } catch (err) {
        console.log(err)
        error(`Unable to load config file "${filename}".`);
    }
}
