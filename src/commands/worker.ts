import { metadata, command, Command } from "clime";
import { external, factory, TSDI } from "tsdi";

import { WorkerConfig } from "../config";
import { Bot, AudioCache, RestApi } from "../server";

@command({ description: "Start the API and the bot." }) @external
export default class ServeCommand extends Command { // tslint:disable-line
    private config: WorkerConfig;

    @metadata
    public execute(
        workerConfig: WorkerConfig,
    ) {
        this.config = workerConfig;

        const tsdi = new TSDI();
        tsdi.enableComponentScanner();
        tsdi.get(Bot);
        tsdi.get(AudioCache);
        tsdi.get(RestApi);
    }

    @factory public getConfig(): WorkerConfig { return this.config; }
}
