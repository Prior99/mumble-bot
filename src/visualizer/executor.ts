import { info, verbose } from "winston";
import { spawn } from "child_process";
import { component, inject } from "tsdi";
import { ServerConfig } from "../config";

@component
export class VisualizerExecutor {
    @inject private config: ServerConfig;

    private get baseCommand() {
        const relevantArgs = [];
        for (let i = 0; i < process.argv.length; ++i) {
            const arg = process.argv[i];
            if (arg === "serve") {
                relevantArgs.push("visualize");
                return relevantArgs;
            }
            relevantArgs.push(arg);
        }
    }

    private run(...args: string[]) {
        return new Promise((resolve, reject) => {
            const [ executable, ...path ] = this.baseCommand;
            verbose(`Starting visualizer: ${[executable, ...path, ...args].join(" ")}`);
            const config = [
                "--sounds-dir", this.config.soundsDir,
                "--tmp-dir", this.config.tmpDir,
            ];
            const child = spawn(executable, [ ...path, ...args, ...config ]);
            child.on("exit", code => {
                if (code === 0) {
                    resolve();
                    return;
                }
                reject();
            });
            child.stdout.on("data", line => {
                info(`From visualizer: ${line.toString().trim()}`);
            });
        });
    }

    public visualizeSound(id: string) {
        return this.run("--sound-id", id);
    }

    public visualizeCached(id: string) {
        return this.run("--cached-id", id);
    }

    public recheck() {
        return this.run("--recheck", "true");
    }
}
