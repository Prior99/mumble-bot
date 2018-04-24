import { metadata, command, Command, Options } from "clime";
import { TSDI } from "tsdi";
import { error, warn } from "winston";

import { ServerConfig, ServerConfigFactory } from "../config";
import { AudioCache, RestApi, AudioOutput, AudioInput, DatabaseFactory, MumbleFactory } from "../server";

@command({ description: "Start the API and the bot." })
export default class ServeCommand extends Command { // tslint:disable-line
    @metadata
    public async execute(config: ServerConfig) {
        process.on("unhandledRejection", err => {
            error(`Unhandled Promise rejection: ${err.message}`);
            console.error(err);
        });
        process.on("uncaughtException", err => {
            error(`Unhandled Promise rejection: ${err.message}`);
            console.error(err);
        });
        const configConsistent = config.load();
        if (!configConsistent) {
            return;
        }
        const tsdi = new TSDI();
        tsdi.enableComponentScanner();

        tsdi.get(ServerConfigFactory).setConfig(config);
        const mumble = tsdi.get(MumbleFactory);
        await mumble.connect();
        const database = tsdi.get(DatabaseFactory);
        await database.connect();
        const api = tsdi.get(RestApi);
        const audioInput = tsdi.get(AudioInput);
        const audioOutput = tsdi.get(AudioOutput);
        tsdi.get(AudioCache);

        let killed = false;
        const kill = async () => {
            if (killed) {
                error("CTRL^C detected. Terminating!");
                process.exit(1);
                return;
            }
            killed = true;
            warn("CTRL^C detected. Secure shutdown initiated.");
            warn("Press CTRL^C again to terminate at your own risk.");
            audioInput.stop();
            audioOutput.stop();
            await mumble.stop();
            await api.stop();
            await database.stop();
            tsdi.close();
        };
        process.on("SIGINT", kill);
    }
}
