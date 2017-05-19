import { DatabaseSound } from "./sounds";
import { Recording } from "./recordings";
import { DatabaseUser } from "./users";

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

export type MetaInformation = MetaInformationRecording | MetaInformationSound;

export interface WorkItem {
    file: string;
    meta: MetaInformation;
    callback?: () => void;
    time: Date;
}
