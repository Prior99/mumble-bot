import {
    api,
    createUserWithToken,
    createTag,
    tagSound,
    createSoundWithCreatorAndSpeaker,
    startDb,
    stopDb,
} from "../../../test-utils";
import { Token } from "../../models";

describe("tags controller", () => {
    let token: Token;

    beforeEach(startDb);
    afterEach(stopDb);

    beforeEach(async () => {
        const userAndToken = await createUserWithToken();
        token = userAndToken.token;
    });

    describe("GET /tags", () => {
        it("responds 401 without a valid token", async () => {
            const response = await api().get("/tags");
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("fetches a list of all tags", async () => {
            const tag1 = await createTag("First Tag", token);
            await createTag("Second Tag", token);
            const { sound } = await createSoundWithCreatorAndSpeaker();
            await tagSound(sound, tag1, token);
            const response = await api().get(`/tags`)
                .set("authorization", `Bearer ${token.id}`);
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                data: [
                    {
                        name: "First Tag",
                        soundTagRelations: [
                            {
                                sound: { id: sound.id },
                            },
                        ],
                    },
                    {
                        name: "Second Tag",
                        soundTagRelations: [],
                    },
                ],
            });
        });
    });

    describe("POST /tags", () => {
        it("responds 401 without a valid token", async () => {
            const response = await api().post(`/tags`)
                .send({ name: "First Tag"});
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("creates a new tag", async () => {
            const createResponse = await api().post("/tags")
                .set("authorization", `Bearer ${token.id}`)
                .send({ name: "First Tag"});
            expect(createResponse.body).toMatchObject({
                data: {
                    name: "First Tag",
                },
            });
            expect(createResponse.status).toBe(201);
            const listResponse = await api().get(`/tags`)
                .set("authorization", `Bearer ${token.id}`);
            expect(listResponse.body).toMatchObject({
                data: [
                    {
                        name: "First Tag",
                    },
                ],
            });
            expect(listResponse.status).toBe(200);
        });
    });
});
