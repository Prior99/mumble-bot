import { createScope } from "hyrest";

export const world = createScope();
export const owner = createScope().include(world);
