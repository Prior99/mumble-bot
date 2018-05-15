import { component } from "tsdi";

@component
export class VisualizerExecutor {
    public visualizeSound(id: string) {
        return new Promise(resolve => setTimeout(resolve, 10));
    }

    public visualizeCached(id: string) {
        return new Promise(resolve => setTimeout(resolve, 10));
    }

    public recheck() {
        return new Promise(resolve => setTimeout(resolve, 10));
    }
}
