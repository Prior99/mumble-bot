import { createScope } from "hyrest";

// General visibility.
export const world = createScope();
export const owner = createScope().include(world);
// Users.
export const login = createScope();
export const signup = createScope().include(login);
export const updateUser = createScope();
// Mumble link.
export const createMumbleLink = createScope();
export const deleteMumbleLink = createScope();
// Sounds.
export const createSound = createScope();
export const updateSound = createScope();
export const upload = createScope();
export const youtubeImport = createScope();
export const fork = createScope();
// Tags.
export const tagSound = createScope();
export const createTag = createScope();
// Queue.
export const enqueue = createScope();
export const live = createScope();
// Playlists.
export const createPlaylist = createScope();
export const listPlaylists = createScope();
export const updatePlaylist = createScope();
// Ratings.
export const rateSound = createScope();
export const listRatings = createScope();
// Statistics.
export const statistics = createScope();
