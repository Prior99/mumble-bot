import { createScope } from "hyrest";

export const world = createScope();
export const login = createScope();
export const createRecording = createScope();
export const createLabel = createScope();
export const createDialog = createScope();
export const createUser = createScope();
export const signup = createScope().include(login);
export const owner = createScope();
