import { pick } from "ramda";
import { api, createUserWithToken, createUser } from "../../../__tests__";
import { User } from "../..";

describe("users controller", () => {
    describe("GET /users", () => {
        it("responds 401 without a valid token", async () => {
            const response = await api().get("/users");
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("returns a list of users when logged in", async () => {
            const { user, token } = await createUserWithToken();
            const users = [
                {
                    ...(await createUser({ name: "2nd-user", email: "2nd@example.com" } as User, false)),
                    avatarUrl:
                        "https://gravatar.com/avatar/ded0c14e09f3c07d977ed341f38164eb?size=200&default=identicon",
                    enabled: false,
                    admin: false,
                }, {
                    ...(await await createUser({ name: "3rd-user", email: "3rd@example.com" } as User, true, true)),
                    avatarUrl:
                        "https://gravatar.com/avatar/40b80c89af474114102231e71bbebdda?size=200&default=identicon",
                    enabled: true,
                    admin: true,
                }, {
                    ...(await createUser({ name: "4th-user", email: "4th@example.com" } as User)),
                    avatarUrl:
                        "https://gravatar.com/avatar/07a03b338ba7d1eb4ab1959546334d80?size=200&default=identicon",
                    enabled: true,
                    admin: false,
                }, {
                    ...user,
                    avatarUrl:
                        "https://gravatar.com/avatar/146d377bd4771d03c8a6cd18bf26964c?size=200&default=identicon",
                    enabled: true,
                    admin: false,
                },
            ];
            const response = await api().get("/users")
                .set("authorization", `Bearer ${token.id}`);
            expect(response.body).toEqual({
                data: users.map(current => pick(["name", "id", "avatarUrl", "enabled", "admin"], current)),
            });
            expect(response.status).toBe(200);
        });
    });

    describe("GET /user/:id", () => {
        it("responds 401 without a valid token", async () => {
            const user = await createUser();
            const response = await api().get(`/user/${user.id}`);
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("responds 401 for unknown user without a valid token", async () => {
            const response = await api().get(`/user/65888dad-7250-4756-bd8d-ed3375007405`);
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("responds 404 for unknown user", async () => {
            const { token } = await createUserWithToken();
            const response = await api().get(`/user/65888dad-7250-4756-bd8d-ed3375007405`)
                .set("authorization", `Bearer ${token.id}`);
            expect(response.body).toEqual({ message: `No user with id "65888dad-7250-4756-bd8d-ed3375007405"` });
            expect(response.status).toBe(404);
        });

        it("fetches a user with a specific id", async () => {
            const { user, token } = await createUserWithToken();
            const response = await api().get(`/user/${user.id}`)
                .set("authorization", `Bearer ${token.id}`);
            expect(response.body).toEqual({
                data: {
                    ...pick(["name", "id"], user),
                    avatarUrl:
                        "https://gravatar.com/avatar/146d377bd4771d03c8a6cd18bf26964c?size=200&default=identicon",
                    enabled: true,
                    admin: false,
                },
            });
            expect(response.status).toBe(200);
        });
    });

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
});
