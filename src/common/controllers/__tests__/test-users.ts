import { pick } from "ramda";
import { api, createUserWithToken, createUser, startDb, stopDb } from "../../../test-utils/";
import { User, Token } from "../..";

describe("users controller", () => {
    beforeEach(startDb);
    afterEach(stopDb);

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
                    admin: true,
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
                    admin: true,
                },
            });
            expect(response.status).toBe(200);
        });
    });

    describe("post /user/:id", () => {
        let adminUser: User, adminToken: Token, otherUser: User;

        beforeEach(async () => {
            const adminUserAndToken = await createUserWithToken();
            adminToken = adminUserAndToken.token;
            adminUser = adminUserAndToken.user;
            const otherUserAndToken = await createUserWithToken();
            otherUser = otherUserAndToken.user;
        });

        it("responds 401 without a valid token", async () => {
            const response = await api().post(`/user/${adminUser.id}`)
                .send({ name: "New name" });
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("responds 401 for unknown user without a valid token", async () => {
            const response = await api().post(`/user/65888dad-7250-4756-bd8d-ed3375007405`)
                .send({ name: "New name" });
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("responds 404 for unknown user", async () => {
            const response = await api().post(`/user/65888dad-7250-4756-bd8d-ed3375007405`)
                .set("authorization", `Bearer ${adminToken.id}`)
                .send({ name: "New name" });
            expect(response.body).toEqual({ message: `No user with id "65888dad-7250-4756-bd8d-ed3375007405".` });
            expect(response.status).toBe(404);
        });

        it("can update the own username", async () => {
            const response = await api().post(`/user/${adminUser.id}`)
                .set("authorization", `Bearer ${adminToken.id}`)
                .send({ name: "New name" });
            expect(response.status).toBe(200);
            const getResponse = await api().get(`/user/${adminUser.id}`)
                .set("authorization", `Bearer ${adminToken.id}`);
            expect(getResponse.body.data.name).toBe("New name");
        });

        it("cannot disabled the current user", async () => {
            const response = await api().post(`/user/${adminUser.id}`)
                .set("authorization", `Bearer ${adminToken.id}`)
                .send({ enabled: false });
            expect(response.body).toEqual({ message: "Can't disable yourself." });
            expect(response.status).toBe(400);
        });

        describe("as an admin", () => {
            it("can update foreign users", async () => {
                const response = await api().post(`/user/${otherUser.id}`)
                    .set("authorization", `Bearer ${adminToken.id}`)
                    .send({ name: "New name" });
                expect(response.status).toBe(200);
                const getResponse = await api().get(`/user/${otherUser.id}`)
                    .set("authorization", `Bearer ${adminToken.id}`);
                expect(getResponse.body.data.name).toBe("New name");
            });

            it("cannot revoke admin status from own user", async () => {
                const response = await api().post(`/user/${adminUser.id}`)
                    .set("authorization", `Bearer ${adminToken.id}`)
                    .send({ admin: false });
                expect(response.body).toEqual({ message: "Can't revoke admin status from yourself." });
                expect(response.status).toBe(400);
            });
        });
    });

    describe("POST /user", () => {
        it("creates a first user being an enabled admin with a good request", async () => {
            const response = await api().post("/user").send({
                email: "some@example.com",
                name: "someone",
                password: "some secure password",
            });
            expect(response.body).toMatchObject({
                data: {
                    email: "some@example.com",
                    name: "someone",
                    admin: true,
                    enabled: true,
                },
            });
            expect(response.status).toBe(201);
        });

        it("creates a second user not being an enabled admin", async () => {
            const response1 = await api().post("/user").send({
                email: "first@example.com",
                name: "first-one",
                password: "some secure password",
            });
            expect(response1.body).toMatchObject({
                data: {
                    email: "first@example.com",
                    name: "first-one",
                    admin: true,
                    enabled: true,
                },
            });
            expect(response1.status).toBe(201);
            const response2 = await api().post("/user").send({
                email: "second@example.com",
                name: "second-one",
                password: "some secure password",
            });
            expect(response2.body).toMatchObject({
                data: {
                    email: "second@example.com",
                    name: "second-one",
                    admin: false,
                    enabled: false,
                },
            });
            expect(response2.status).toBe(201);
        });
    });
});
