export { Sound } from "./sound";
import { Sound } from "./sound";
export { User } from "./user";
import { User } from "./user";
export { Label } from "./label";
import { Label } from "./label";
export { CachedAudio } from "./cached-audio";
export { SoundLabelRelation } from "./sound-label-relation";
import { SoundLabelRelation } from "./sound-label-relation";
export { Playlist } from "./playlist";
import { Playlist } from "./playlist";
export { PlaylistEntry } from "./playlist-entry";
import { PlaylistEntry } from "./playlist-entry";
export { MumbleLink } from "./mumble-link";
import { MumbleLink } from "./mumble-link";
export { Permission } from "./permission";
export { PermissionAssociation } from "./permission-association";
import { PermissionAssociation } from "./permission-association";
export { Token } from "./token";
import { Token } from "./token";
export { MumbleUser } from "./mumble-user";
export { Channel } from "./channel";
export { PlaybackOptions } from "./playback-options";
export { ForkOptions } from "./fork-options";
export { Setting } from "./setting";
import { Setting } from "./setting";

export const allDatabaseModels = [
    User,
    Label,
    SoundLabelRelation,
    Sound,
    Playlist,
    PlaylistEntry,
    MumbleLink,
    PermissionAssociation,
    Token,
    Setting,
];
