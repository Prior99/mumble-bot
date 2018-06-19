import { mkdirp, readdir, existsSync, writeFile, statSync } from "fs-extra";
import { join } from "path";
import { warn, error, info } from  "winston";
import { metadata, command, Command } from "clime";
import { VisualizerConfig } from "../config";
import { setupWinston } from "../common";
import { visualizeAudioFile } from "../visualizer";

setupWinston();

@command({ description: "Start the worker." })
export default class VisualizerCommand extends Command { // tslint:disable-line
    private getVisualizationFilename = file => `${file}.png`;
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
            !path.startsWith("upload-") &&
            !path.startsWith("youtube-") &&
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

    @metadata
    public async execute(config: VisualizerConfig) {
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

        if (config.recheck) {
            this.generateMissingVisualizations(config.soundsDir);
        }
        if (config.cachedId || config.soundId) {
            const path = config.cachedId ?
                join(config.tmpDir, config.cachedId) :
                join(config.soundsDir, config.soundId);
            if (!existsSync(path)) {
                error(`File not found: ${path}`);
            } else {
                info(`Visualizing file ${path}`);
                this.generateVisualization(path);
            }
        }

        process.on("SIGINT", () => {
            if (this.killed) {
                error("CTRL^C detected. Terminating!");
                process.exit(1);
                return;
            }
            this.killed = true;
            warn("CTRL^C detected. Secure shutdown initiated.");
            warn("Press CTRL^C again to terminate at your own risk.");
        });
    }
}
