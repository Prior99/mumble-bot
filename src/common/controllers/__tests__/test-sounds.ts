import { api, createSoundWithCreatorAndSpeaker, createUserWithToken, createTag, tagSound } from "../../../__tests__";
import { Token, Sound, Tag } from "../../";

describe("sounds controller", () => {
    describe("GET /sound/:id", () => {
        it("responds 401 without a valid token", async () => {
            const { sound } = await createSoundWithCreatorAndSpeaker();
            const response = await api().get(`/sound/${sound.id}`);
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("responds 401 for unknown sound without a valid token", async () => {
            const response = await api().get("/sound/65888dad-7250-4756-bd8d-ed3375007405");
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("responds 404 for unknown sound", async () => {
            const { token } = await createUserWithToken();
            const response = await api().get(`/sound/65888dad-7250-4756-bd8d-ed3375007405`)
                .set("authorization", `Bearer ${token.id}`);
            expect(response.body).toEqual({ message: `No sound with id "65888dad-7250-4756-bd8d-ed3375007405"` });
            expect(response.status).toBe(404);
        });

        it("fetches a sound with a specific id", async () => {
            const { token } = await createUserWithToken();
            const tag = await createTag("Some tag", token);
            const { sound, creator, speaker } = await createSoundWithCreatorAndSpeaker();
            await tagSound(sound, tag, token);
            const response = await api().get(`/sound/${sound.id}`)
                .set("authorization", `Bearer ${token.id}`);
            expect(response.body).toMatchObject({
                data: {
                    creator: {
                        avatarUrl: creator.avatarUrl,
                        id: creator.id,
                        name: creator.name,
                    },
                    description: "Some sound",
                    duration: 13,
                    overwrite: false,
                    soundTagRelations: [
                        {
                            tag: {
                                id: tag.id,
                                name: tag.name,
                            },
                        },
                    ],
                    used: 17,
                    user: {
                        avatarUrl: speaker.avatarUrl,
                        id: speaker.id,
                        name: speaker.name,
                    },
                },
            });
            expect(response.status).toBe(200);
        });
    });

    describe("POST /sound/:id/tags", () => {
        let token: Token, sound: Sound, tag: Tag;

        beforeEach(async () => {
            token = (await createUserWithToken()).token;
            sound = (await createSoundWithCreatorAndSpeaker()).sound;
            tag = await createTag("Some tag", token);
        });

        it("responds 401 without a valid token", async () => {
            const response = await api().post(`/sound/${sound.id}/tags`).send(tag);
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("responds 401 for unknown sound without a valid token", async () => {
            const response = await api().post(`/sound/65888dad-7250-4756-bd8d-ed3375007405/tags`).send(tag);
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("responds 404 for unknown sound", async () => {
            const response = await api().post(`/sound/65888dad-7250-4756-bd8d-ed3375007405/tags`)
                .set("authorization", `Bearer ${token.id}`)
                .send({ id: tag.id });
            expect(response.body).toEqual({ message: `No sound with id "65888dad-7250-4756-bd8d-ed3375007405"` });
            expect(response.status).toBe(404);
        });

        it("responds 401 for unknown tag without a valid token", async () => {
            const response = await api().post(`/sound/${sound.id}/tags`)
                .send({ id: "65888dad-7250-4756-bd8d-ed3375007405" });
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("responds 404 for unknown tag", async () => {
            const response = await api().post(`/sound/${sound.id}/tags`)
                .set("authorization", `Bearer ${token.id}`)
                .send({ id: "65888dad-7250-4756-bd8d-ed3375007405" });
            expect(response.body).toEqual({ message: `No tag with id "65888dad-7250-4756-bd8d-ed3375007405"` });
            expect(response.status).toBe(404);
        });

        it("tags the sound with the specified tag", async () => {
            const tag1 = await createTag("Some tag", token);
            const tag2 = await createTag("Another tag", token);
            await tagSound(sound, tag1, token);
            const response = await api().post(`/sound/${sound.id}/tags`)
                .set("authorization", `Bearer ${token.id}`)
                .send({ id: tag2.id });
            expect(response.body).toMatchObject({
                data: {
                    soundTagRelations: [
                        {
                            tag: {
                                id: tag1.id,
                                name: tag1.name,
                            },
                        }, {
                            tag: {
                                id: tag2.id,
                                name: tag2.name,
                            },
                        },
                    ],
                },
            });
            expect(response.status).toBe(201);
        });
    });

    describe("DELETE /sound/:id/tag/:tagId", () => {
        let token: Token, sound: Sound, tag: Tag;

        beforeEach(async () => {
            token = (await createUserWithToken()).token;
            sound = (await createSoundWithCreatorAndSpeaker()).sound;
            tag = (await createTag("Some Tag", token));
            await tagSound(sound, tag, token);
        });

        it("responds 401 without a valid token", async () => {
            const response = await api().delete(`/sound/${sound.id}/tag/${tag.id}`);
            expect(response.status).toBe(401);
        });

        it("responds 401 for unknown sound without a valid token", async () => {
            const response = await api().delete(`/sound/65888dad-7250-4756-bd8d-ed3375007405/tag/${tag.id}`);
            expect(response.status).toBe(401);
        });

        it("responds 404 for unknown sound", async () => {
            const response = await api().delete(`/sound/65888dad-7250-4756-bd8d-ed3375007405/tag/${tag.id}`)
                .set("authorization", `Bearer ${token.id}`);
            expect(response.body).toEqual({ message: `No sound with id "65888dad-7250-4756-bd8d-ed3375007405"` });
            expect(response.status).toBe(404);
        });

        it("responds 401 for unknown tag without a valid token", async () => {
            const response = await api().delete(`/sound/${sound.id}/tag/65888dad-7250-4756-bd8d-ed3375007405`);
            expect(response.status).toBe(401);
        });

        it("responds 404 for unknown tag", async () => {
            const response = await api().delete(`/sound/${sound.id}/tag/65888dad-7250-4756-bd8d-ed3375007405`)
                .set("authorization", `Bearer ${token.id}`);
            expect(response.body).toEqual({ message: `No tag with id "65888dad-7250-4756-bd8d-ed3375007405"` });
            expect(response.status).toBe(404);
        });

        it("removes the tag from the specified sound", async () => {
            const response = await api().delete(`/sound/${sound.id}/tag/${tag.id}`)
                .set("authorization", `Bearer ${token.id}`);
            expect(response.body.data.soundTagRelations).toEqual([]);
            expect(response.status).toBe(200);
        });
    });
});
