import { mkdirp, readdir, existsSync, writeFile, statSync } from "fs-extra";
import { warn, error, info } from  "winston";
import { metadata, command, Command } from "clime";
import { watch, FSWatcher } from "chokidar";
import { WorkerConfig } from "../config";
import { AudioCache, RestApi } from "../server";
import { setupWinston } from "../common";
import { visualizeAudioFile } from "../worker";

setupWinston();

@command({ description: "Start the worker." })
export default class WorkerCommand extends Command { // tslint:disable-line
    private getVisualizationFilename = file => `${file}.png`;
    private watcher: FSWatcher;
    private killed = false;

    private async generateVisualization(file: string) {
        const destination = this.getVisualizationFilename(file);
        try {
            const buffer = await visualizeAudioFile(file);
            await writeFile(destination, buffer);
        } catch (err) {
            error(`Failed to generate visualization for file ${file}:`, err);
        }
    }

    private shouldGenerateVisualization(path: string) {
        return !path.endsWith("png") &&
            !path.endsWith("json") &&
            !statSync(path).isDirectory() &&
            !existsSync(this.getVisualizationFilename(path));
    }

    private async generateMissingVisualizations(path: string) {
        const missingFiles = (await readdir(path))
            .map(file => `${path}/${file}`)
            .filter(file => this.shouldGenerateVisualization(file));
        if (missingFiles.length === 0) { return; }
        info(`Found ${missingFiles.length} missing visualizations in ${path}.`);
        for (let [index, file] of missingFiles.entries()) {
            if (this.killed) { return; }
            const percent = (100 * index / missingFiles.length).toFixed(2);
            info(`Visualizing ${file} to ${this.getVisualizationFilename(file)}. ` +
                `File ${index}/${missingFiles.length} (${percent}% done.)`,
            );
            await this.generateVisualization(file);
        }
        info(`All missing visualizations generated.`);
    }

    private watchDirectory(path: string) {
        info(`Watching directory ${path} for changes...`);
        this.generateMissingVisualizations(path);
        this.watcher = watch(`${path}/*`, { ignoreInitial: true })
            .on("add", (file) => {
                if (!this.shouldGenerateVisualization(file)) { return; }
                info(`New file detected: ${file}.`);
                this.generateVisualization(file);
            });
    }

    @metadata
    public async execute(config: WorkerConfig) {
        if (!config.load()) { return; }

        try {
            await mkdirp(`${config.tmpDir}/useraudio`);
            await mkdirp(config.soundsDir);
        }
        catch (err) {
            if (err.code !== "EEXIST") {
                error("Error creating directories:", err);
                return;
            }
        }

        this.generateMissingVisualizations(config.soundsDir);
        this.watchDirectory(config.tmpDir);

        process.on("SIGINT", () => {
            if (this.killed) {
                error("CTRL^C detected. Terminating!");
                process.exit(1);
                return;
            }
            this.killed = true;
            warn("CTRL^C detected. Secure shutdown initiated.");
            warn("Press CTRL^C again to terminate at your own risk.");
            this.watcher.close();
        });
    }
}
