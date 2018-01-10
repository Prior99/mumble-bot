import { option, Options } from "clime";

export class PathsConfig extends Options {
    @option({ name: "tmpDir", description: "Path to the directory to store temporary files in." })
    public tmp: string;

    @option({ name: "recordingsDir", description: "Path to the directory to store the recordings in." })
    public recordings: string;

    @option({ name: "visualizationsDir", description: "Path to the directory to store the visualizations in." })
    public visualizations: string;

    @option({ name: "uploadDir", description: "Path to the directory to store the uploaded sounds in." })
    public uploaded: string;
}
