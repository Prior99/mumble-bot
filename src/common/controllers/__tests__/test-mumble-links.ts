import { api, createUserWithToken, createUser, linkMumbleUser } from "../../../__tests__";

describe("mumble-links controller", () => {
    describe("POST /mumble-link", () => {
        it("responds 401 without a valid token", async () => {
            const user = await createUser();
            const response = await api().post("/mumble-link")
                .send({
                    mumbleId: 4,
                    user: {
                        id: user.id,
                    },
                });
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("responds 403 when attempting to link to another user", async () => {
            const { user, token } = await createUserWithToken();
            const otherUser = await createUser();
            const response = await api().post("/mumble-link")
                .set("authorization", `Bearer ${token.id}`)
                .send({
                    mumbleId: 4,
                    user: {
                        id: otherUser.id,
                    },
                });
            expect(response.body).toEqual({ message: "Can't link a mumble user to a foreign user." });
            expect(response.status).toBe(403);
        });

        it("responds 400 when attempting to link to an unknown mumble user", async () => {
            const { user, token } = await createUserWithToken();
            const response = await api().post("/mumble-link")
                .set("authorization", `Bearer ${token.id}`)
                .send({
                    mumbleId: 1337,
                    user: {
                        id: user.id,
                    },
                });
            expect(response.body).toEqual({ message: "Unknown mumble user." });
            expect(response.status).toBe(400);
        });

        it("creates a link with a good request", async () => {
            const { user, token } = await createUserWithToken();
            const response = await api().post("/mumble-link")
                .set("authorization", `Bearer ${token.id}`)
                .send({
                    mumbleId: 4,
                    user: {
                        id: user.id,
                    },
                });
            expect(response.body).toMatchObject({
                data: {
                    mumbleId: 4,
                    name: "Stranger one",
                    user: {
                        id: user.id,
                    },
                },
            });
            expect(response.status).toBe(201);
        });
    });

    describe("GET /mumble-links", () => {
        it("responds 401 without a valid token", async () => {
            const response = await api().get("/mumble-links");
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("fetches a list of all mumble links", async () => {
            const { user: otherUser1, token: otherUser1Token } =
                await createUserWithToken({ name: "user1", email: "user1@example.com" });
            const { user: otherUser2, token: otherUser2Token } =
                await createUserWithToken({ name: "user2", email: "user2@example.com" });
            await linkMumbleUser(otherUser1.id, otherUser1Token.id, 4);
            await linkMumbleUser(otherUser2.id, otherUser2Token.id, 7);
            const { user, token } = await createUserWithToken();
            const response = await api().get("/mumble-links")
                .set("authorization", `Bearer ${token.id}`);
            expect(response.body).toMatchObject({
                data: [
                    {
                        mumbleId: 4,
                        name: "Stranger one",
                        user: {
                            id: otherUser1.id,
                            name: "user1",
                        },
                    }, {
                        mumbleId: 7,
                        name: "Stranger two",
                        user: {
                            id: otherUser2.id,
                            name: "user2",
                        },
                    },
                ],
            });
            expect(response.status).toBe(200);
        });
    });
});
