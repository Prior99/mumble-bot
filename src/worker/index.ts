import { readdir, exists, writeFile, stat } from "async-file";
import { basename } from "path";
import { watch } from "chokidar";
import * as Winston from "winston";
import mkdirp = require("mkdirp-promise"); // tslint:disable-line
import { setupWinston } from "../common";
import { visualizeAudioFile } from "./visualizer";

setupWinston("worker.log");

const config = require("../../config.json"); // tslint:disable-line

type PathTranform = (source: string) => string;

async function generateMissingVisualization(file: string, transform: PathTranform) {
    const destination = transform(file);
    if (await exists(destination) || file.endsWith("png") || (await stat(file)).isDirectory()) {
        return;
    }
    Winston.verbose(`Generating missing visualization for ${file} ...`);
    try {
        const buffer = await visualizeAudioFile(file);
        await writeFile(destination, buffer);
        Winston.info(`Generated visualization for ${file} to ${destination}.`);
    } catch (err) {
        Winston.error(`Failed to generate visualization for file ${file}:`, err);
    }
}

async function generateMissingVisualizations(path: string, transform: PathTranform) {
    const files = (await readdir(path)).map(file => `${path}/${file}`);

    for (let file of files) {
        await generateMissingVisualization(file, transform);
    }
}

function watchDirectory(path: string, pathTransform: PathTranform) {
    Winston.info(`Watching directory ${path} for changes...`);
    generateMissingVisualizations(path, pathTransform);
    watch(path, { ignoreInitial: true })
        .on("add", (file) => {
            Winston.verbose(`Change detected in directory ${file}.`);
            generateMissingVisualization(file, pathTransform);
        });
}
async function main() {
    Winston.info("Worker starting...");
    try {
        await mkdirp(`${config.paths.tmp}/useraudio`);
        await mkdirp(config.paths.recordings);
        await mkdirp(config.paths.visualizations);
    }
    catch (err) {
        if (err.code !== "EEXIST") {
            Winston.error("Error creating directories:", err);
            return;
        }
    }

    watchDirectory(`${config.paths.tmp}/useraudio/**/*.mp3`, file => `${file}.png`);
    watchDirectory(config.paths.recordings, file => `${config.paths.visualizations}/${basename(file)}.png`);
    Winston.info("Worker started.");
}

main();
