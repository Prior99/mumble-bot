import { createScope } from "hyrest";

export const world = createScope();
export const login = createScope();
export const updateSound = createScope();
export const createLabel = createScope();
export const createPlaylist = createScope();
export const signup = createScope().include(login);
export const owner = createScope().include(world);
export const createSound = createScope();
export const createMumbleLink = createScope();
