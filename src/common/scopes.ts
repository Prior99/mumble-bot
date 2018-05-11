import { createScope } from "hyrest";

export const world = createScope();
export const login = createScope();
export const updateSound = createScope();
export const createTag = createScope();
export const createPlaylist = createScope();
export const signup = createScope().include(login);
export const owner = createScope().include(world);
export const createSound = createScope();
export const createMumbleLink = createScope();
export const deleteMumbleLink = createScope();
export const tagSound = createScope();
export const enqueue = createScope();
export const live = createScope();
export const listPlaylists = createScope();
export const updateUser = createScope();
export const upload = createScope();
