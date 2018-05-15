import { metadata, command, Command } from "clime";
import { TSDI } from "tsdi";
import { error, warn } from "winston";
import { ServerConfig, ServerConfigFactory } from "../config";
import { AudioInput, AudioOutput, AudioCache, RestApi, DatabaseFactory, MumbleFactory } from "../server";
import { VisualizerExecutor } from "../visualizer";

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
        // Load the configuration.
        if (!config.load()) { return; }
        const tsdi = new TSDI();
        tsdi.enableComponentScanner();
        // Initialize config.
        tsdi.get(ServerConfigFactory).setConfig(config);
        // Initialize mumble.
        await tsdi.get(MumbleFactory).connect();
        // Initialize database.
        await tsdi.get(DatabaseFactory).connect();
        // Start api.
        tsdi.get(RestApi).serve();
        // Initialize audio cache, input and output here as they can't
        // be eager.
        tsdi.get(AudioCache);
        tsdi.get(AudioInput);
        tsdi.get(AudioOutput);
        tsdi.get(VisualizerExecutor).recheck();

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
            tsdi.close();
        };
        process.on("SIGINT", kill);
    }
}
