import { createScope } from "hyrest";

export const world = createScope();
export const login = createScope();
export const updateRecording = createScope();
export const createLabel = createScope();
export const createDialog = createScope();
export const signup = createScope().include(login);
export const owner = createScope().include(world);
export const createRecording = createScope();
export const createMumbleLink = createScope();
export const createSound = createScope();
