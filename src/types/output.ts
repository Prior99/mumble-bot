import { DatabaseSound } from "./sounds";
import { Recording } from "./recordings";
import { DatabaseUser } from "./users";
import { CachedAudio } from "./cached-audio";

export interface MetaInformationRecording {
    type: "recording";
    recording: Recording;
    user: DatabaseUser
}

export interface MetaInformationSound {
    type: "sound";
    sound: DatabaseSound;
    user: DatabaseUser
}

export interface MetaInformationCached {
    type: "cached";
    cachedRecording: CachedAudio;
    user: DatabaseUser
}

export interface MetaInformationDialog {
    type: "dialog";
    user: DatabaseUser
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
}
