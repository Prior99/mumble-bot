import { metadata, command, Command, Options } from "clime";
import { external, factory, TSDI } from "tsdi";
import { error, warn } from "winston";

import { ServerConfig } from "../config";
import { AudioCache, RestApi, AudioOutput, AudioInput } from "../server";

@command({ description: "Start the API and the bot." }) @external
export default class ServeCommand extends Command { // tslint:disable-line
    private config: ServerConfig;

    @metadata
    public execute(config: ServerConfig) {
        this.config = config;
        const tsdi = new TSDI();
        tsdi.enableComponentScanner();
        const audioCache = tsdi.get(AudioCache);
        const api = tsdi.get(RestApi);
        const audioInput = tsdi.get(AudioInput);
        const audioOutput = tsdi.get(AudioOutput);

        let killed = false;
        const kill = () => {
            if (killed) {
                error("CTRL^C detected. Terminating!");
                process.exit(1);
                return;
            }
            killed = true;
            warn("CTRL^C detected. Secure shutdown initiated.");
            warn("Press CTRL^C again to terminate at your own risk.");
            api.stop();
            audioInput.stop();
            audioOutput.stop();
        };
        process.on("SIGINT", kill);
    }

    @factory public getConfig(): ServerConfig { return this.config; }
}
