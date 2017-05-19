import { DatabaseSound } from "./sounds";
import { Recording } from "./recordings";
import { DatabaseUser } from "./users";

export interface MetaInformationRecording {
    type: "record";
    details: Recording;
    user: DatabaseUser
}

export interface MetaInformationSound {
    type: "sound";
    details: DatabaseSound;
    user: DatabaseUser
}

export type MetaInformation = MetaInformationRecording | MetaInformationSound;

export interface WorkItem {
    file: string;
    meta: MetaInformation;
    callback?: () => void;
    time: Date;
}
