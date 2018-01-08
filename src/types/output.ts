import { CachedAudio, DatabaseUser, Recording, DatabaseSound } from "../models";

export interface MetaInformationRecording {
    type: "recording";
    recording: Recording;
    user: DatabaseUser;
}

export interface MetaInformationSound {
    type: "sound";
    sound: DatabaseSound;
    user: DatabaseUser;
}

export interface MetaInformationCached {
    type: "cached";
    cachedRecording: CachedAudio;
    user: DatabaseUser;
}

export interface MetaInformationDialog {
    type: "dialog";
    user: DatabaseUser;
}

export type MetaInformation = MetaInformationRecording|
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
