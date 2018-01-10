import { option, Options } from "clime";

export class GeneralConfig extends Options {
    @option({ flag: "c", description: "Path to the configuration file.", required: true })
    public configFile: string;

    @option({ description: "Amount of cached recordings to keep." })
    public audioCacheAmount: number;
}
