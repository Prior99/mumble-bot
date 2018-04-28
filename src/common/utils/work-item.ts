import { CachedAudio, User, Sound } from "..";

export interface MetaInformationSound {
    type: "sound";
    sound: Sound;
    user: User;
}

export interface MetaInformationCached {
    type: "cached";
    cachedSound: CachedAudio;
    user: User;
}

export interface MetaInformationDialog {
    type: "dialog";
    user: User;
}

export type MetaInformation = MetaInformationSound |
    MetaInformationSound |
    MetaInformationCached |
    MetaInformationDialog;

export interface WorkItem {
    file: string;
    meta: MetaInformation;
    callback?: () => void;
    time: Date;
    pitch: number;
}

export function convertWorkItem(item: WorkItem) {
    const { meta, time } = item;
    const { user, type } = meta;
    if (meta.type === "sound") {
        const { sound } = meta;
        return {
            time,
            user: user.id,
            sound: sound.id,
            type,
        };
    }
    if (meta.type === "cached") {
        const { cachedSound } = meta;
        return {
            time,
            user: user.id,
            cachedSound: cachedSound.id,
            type,
        };
    }
    if (meta.type === "dialog") {
        return {
            time,
            user: user.id,
            type,
        };
    }
}
