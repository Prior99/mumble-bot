import { api, createUserWithToken, createSound, createPlaylist } from "../../../test-utils";
import { User, Token, Sound, Playlist } from "../../models";

describe("playlists controller", () => {
    let token: Token;
    let user: User;
    let sounds: Sound[];
    let playlist1: Playlist;
    let playlist2: Playlist;
    let playlist1Response: any;
    let playlist2Response: any;

    beforeEach(async () => {
        const userAndToken = await createUserWithToken();
        token = userAndToken.token;
        user = userAndToken.user;
        const descriptions = ["First sound", "Second sound", "Third sound", "Fourth sound"];
        sounds = await Promise.all(descriptions.map(async description => {
            return await createSound({
                description,
                creator: user,
                user,
            } as Sound);
        }));
        playlist1 = await createPlaylist(user, 0, sounds[0], sounds[1], sounds[3]);
        playlist2 = await createPlaylist(user, 0, sounds[2], sounds[1], sounds[0]);
        playlist1Response = {
            id: playlist1.id,
            created: playlist1.created.toISOString(),
            creator: { id: user.id },
            description: "A Playlist",
            entries: [
                { sound: { id: sounds[0].id }, position: 0 },
                { sound: { id: sounds[1].id }, position: 1 },
                { sound: { id: sounds[3].id }, position: 2 },
            ],
        };
        playlist2Response = {
            id: playlist2.id,
            created: playlist2.created.toISOString(),
            creator: { id: user.id },
            description: "A Playlist",
            entries: [
                { sound: { id: sounds[2].id }, position: 0 },
                { sound: { id: sounds[1].id }, position: 1 },
                { sound: { id: sounds[0].id }, position: 2 },
            ],
        };
    });

    describe("GET /playlists", () => {
        it("responds 401 without a valid token", async () => {
            const response = await api().get("/playlists");
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("fetches a list of all playlists", async () => {
            const response = await api().get(`/playlists?sort=created&sortDirection=desc`)
                .set("authorization", `Bearer ${token.id}`);
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                data: {
                    totalPlaylists: 2,
                    playlists: [ playlist2Response, playlist1Response ],
                },
            });
        });
    });

    describe("GET /playlist/:id", () => {
        it("responds 401 without a valid token", async () => {
            const response = await api().get(`/playlist/${playlist1.id}`);
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("responds 401 without a valid token and an unknown playlist", async () => {
            const response = await api().get("/playlist/626256d1-820b-4c6d-a68d-59bbc447dcc3");
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("responds 404 with an unknown playlist", async () => {
            const response = await api().get("/playlist/626256d1-820b-4c6d-a68d-59bbc447dcc3")
                .set("authorization", `Bearer ${token.id}`);
            expect(response.body).toEqual({ message: "No playlist with id 626256d1-820b-4c6d-a68d-59bbc447dcc3" });
            expect(response.status).toBe(404);
        });

        it("fetches the specified playlist", async () => {
            const response = await api().get(`/playlist/${playlist1.id}`)
                .set("authorization", `Bearer ${token.id}`);
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                data: playlist1Response,
            });
        });
    });

    describe("POST /playlists", () => {
        it("responds 401 without a valid token", async () => {
            const response = await api().post(`/playlists`)
                .send(playlist1);
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("creates a new playlist", async () => {
            const newPlaylist = {
                description: "My fancy Playlist",
                entries: [
                    { sound: { id: sounds[0].id }, position: 0 },
                    { sound: { id: sounds[0].id }, position: 1 },
                    { sound: { id: sounds[1].id }, position: 2 },
                    { sound: { id: sounds[1].id }, position: 3 },
                ],
            };
            const createResponse = await api().post("/playlists")
                .set("authorization", `Bearer ${token.id}`)
                .send(newPlaylist);
            expect(createResponse.body).toMatchObject({
                data: {
                    ...newPlaylist,
                    used: 0,
                },
            });
            expect(createResponse.status).toBe(201);
            const listResponse = await api().get(`/playlists?sort=created&sortDirection=desc`)
                .set("authorization", `Bearer ${token.id}`);
            expect(listResponse.body).toMatchObject({
                data: {
                    playlists: [
                        {
                            ...newPlaylist,
                            used: 0,
                            id: createResponse.body.data.id,
                            created: createResponse.body.data.created,
                        },
                        playlist2Response,
                        playlist1Response,
                    ],
                },
            });
            expect(listResponse.status).toBe(200);
        });
    });
});
