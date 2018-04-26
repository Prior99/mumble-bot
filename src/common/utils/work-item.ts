import { CachedAudio, User, Recording, DatabaseSound } from "..";

export interface MetaInformationRecording {
    type: "recording";
    recording: Recording;
    user: User;
}

export interface MetaInformationSound {
    type: "sound";
    sound: DatabaseSound;
    user: User;
}

export interface MetaInformationCached {
    type: "cached";
    cachedRecording: CachedAudio;
    user: User;
}

export interface MetaInformationDialog {
    type: "dialog";
    user: User;
}

export type MetaInformation = MetaInformationRecording |
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
    if (meta.type === "recording") {
        const { recording } = meta;
        return {
            time,
            user: user.id,
            recording: recording.id,
            type,
        };
    }
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
        const { cachedRecording } = meta;
        return {
            time,
            user: user.id,
            cachedRecording: cachedRecording.id,
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
