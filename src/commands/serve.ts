import { metadata, command, Command, Options } from "clime";
import { external, factory, TSDI } from "tsdi";

import { ServerConfig } from "../config";
import { Bot, AudioCache, RestApi } from "../server";

@command({ description: "Start the API and the bot." }) @external
export default class ServeCommand extends Command { // tslint:disable-line
    private config: ServerConfig;

    @metadata
    public execute(
        config: ServerConfig
    ) {
        this.config = config;
        const tsdi = new TSDI();
        tsdi.enableComponentScanner();
        tsdi.get(Bot);
        tsdi.get(AudioCache);
        tsdi.get(RestApi);
    }

    @factory public getConfig(): ServerConfig { return this.config; }
}
