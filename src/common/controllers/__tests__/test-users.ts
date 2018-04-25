import { pick } from "ramda";
import { api, createUserWithToken, createUser } from "../../../__tests__";

describe("users controller", () => {
    describe("POST /user", () => {
        it("creates a new user with a good request", async () => {
            const response = await api().post("/user")
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
            const response = await api().get("/users");
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("returns a list of users when logged in", async () => {
            const { user, token } = await createUserWithToken();
            const users = [
                user,
                await createUser({ name: "2nd-user", email: "2nd@example.com" }),
                await createUser({ name: "3rd-user", email: "3rd@example.com" }),
                await createUser({ name: "4th-user", email: "4th@example.com" }),
            ];
            const response = await api().get("/users")
                .set("authorization", `Bearer ${token.id}`);
            expect(response.body).toEqual({
                data: users.map(current => pick(["name", "id"], current)),
            });
            expect(response.status).toBe(200);
        });
    });
});
