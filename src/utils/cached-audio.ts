import { CachedAudio } from "../common";

export function compareCachedAudio(a: CachedAudio, b: CachedAudio): number {
    if (a.protected === b.protected) {
        return a.date > b.date ? -1 : 1;
    }
    else {
        return a.protected ? -1 : 1;
    }
}
