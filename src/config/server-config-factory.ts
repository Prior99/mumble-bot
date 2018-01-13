import { component, factory } from "tsdi";
import { ServerConfig } from "../config";

@component
export class ServerConfigFactory {
    private config: ServerConfig;

    public setConfig(config: ServerConfig) { this.config = config; }

    @factory
    public getConfig(): ServerConfig { return this.config; }
}
