import { api, createUserWithToken, createUser, linkMumbleUser, startDb, stopDb } from "../../../test-utils";
import { User, Token, MumbleLink } from "../../models";

describe("mumble-links controller", () => {

    beforeEach(startDb);
    afterEach(stopDb);

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
            const { token } = await createUserWithToken();
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
                    user: {
                        id: user.id,
                    },
                },
            });
            expect(response.status).toBe(201);
        });

        it("responds 409 when trying to link to a user twice", async () => {
            const { user: user1, token: token1 } = await createUserWithToken({
                name: "user1",
                email: "user1@example.com",
            } as User);
            const { user: user2, token: token2 } = await createUserWithToken({
                name: "user2",
                email: "user2@example.com",
            } as User);
            await linkMumbleUser(user1.id, token1.id, 4);
            const response = await api().post("/mumble-link")
                .set("authorization", `Bearer ${token2.id}`)
                .send({
                    mumbleId: 4,
                    user: { id: user2.id },
                });
            expect(response.body).toMatchObject({ message: `Mumble user with id "4" is already linked.` });
            expect(response.status).toBe(409);
        });
    });

    describe("DELETE /mumble-link/:id", () => {
        let mumbleLink: MumbleLink, user: User, token: Token, otherToken: Token;

        beforeEach(async () => {
            const userAndToken = await createUserWithToken({ name: "user1", email: "user1@example.com" } as User);
            user = userAndToken.user;
            token = userAndToken.token;
            const otherUserAndToken = await createUserWithToken({ name: "user2", email: "user2@example.com" } as User);
            otherToken = otherUserAndToken.token;
            mumbleLink = await linkMumbleUser(user.id, token.id, 4);
        });

        it("responds 401 without a valid token", async () => {
            const response = await api().delete(`/mumble-link/${mumbleLink.id}`);
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("responds 401 without a valid token with an unknown link", async () => {
            const response = await api().delete("/mumble-link/ad9fa629-082b-4dcb-b34c-2150bcd15376");
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("responds 404 with an unknown link", async () => {
            const response = await api().delete("/mumble-link/ad9fa629-082b-4dcb-b34c-2150bcd15376")
                .set("authorization", `Bearer ${token.id}`);
            expect(response.body).toEqual({
                message: `No mumble link with id "ad9fa629-082b-4dcb-b34c-2150bcd15376" found.`,
            });
            expect(response.status).toBe(404);
        });

        it("responds 403 when trying to delete another users's link", async () => {
            const response = await api().delete(`/mumble-link/${mumbleLink.id}`)
                .set("authorization", `Bearer ${otherToken.id}`);
            expect(response.body).toEqual({ message: "Can't delete link of a foreign user." });
            expect(response.status).toBe(403);
        });

        it("deletes the specified link", async () => {
            const response = await api().delete(`/mumble-link/${mumbleLink.id}`)
                .set("authorization", `Bearer ${token.id}`);
            expect(response.status).toBe(200);
            const getResponse = await api().get("/mumble-links")
                .set("authorization", `Bearer ${token.id}`);
            expect(getResponse.body.data).toEqual([]);
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
                await createUserWithToken({ name: "user1", email: "user1@example.com" } as User);
            const { user: otherUser2, token: otherUser2Token } =
                await createUserWithToken({ name: "user2", email: "user2@example.com" } as User);
            await linkMumbleUser(otherUser1.id, otherUser1Token.id, 4);
            await linkMumbleUser(otherUser2.id, otherUser2Token.id, 7);
            const { token } = await createUserWithToken();
            const response = await api().get("/mumble-links")
                .set("authorization", `Bearer ${token.id}`);
            expect(response.body).toMatchObject({
                data: [
                    {
                        mumbleId: 4,
                        user: {
                            id: otherUser1.id,
                            name: "user1",
                        },
                    }, {
                        mumbleId: 7,
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
