import * as SuperTest from "supertest";
import { RestApi } from "../server";

export const api = () => SuperTest(tsdi.get(RestApi).app);
