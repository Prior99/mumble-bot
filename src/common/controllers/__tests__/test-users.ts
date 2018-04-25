import * as request from "supertest";
import { SuperTest, Test } from "supertest";
import { omit } from "ramda";
import { RestApi } from "../../../server/api";
import { signup } from "../..";

describe("users controller", () => {
    let api: SuperTest<Test>;

    beforeEach(() => {
        api = request(tsdi.get(RestApi).app);
    });

    describe("POST /user", () => {
        it("creates a new user with a good request", async () => {
            const response = await api.post("/user")
                .send({
                    email: "some@example.com",
                    name: "someone",
                    password: "some secure password",
                });
            expect(response.body).toMatchObject({
                data: {
                    email: "some@example.com",
                    name: "someone",
                },
            });
            expect(response.status).toBe(201);
        });
    });

    describe("GET /users", () => {
        it("responds 401 without a valid token", async () => {
            const response = await api.get("/users");
            expect(JSON.parse(response.text)).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });
    });
});
