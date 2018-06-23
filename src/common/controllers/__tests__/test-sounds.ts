import { omit, pick } from "ramda";
import { populate } from "hyrest";
import { readFileSync } from "fs";
import { copy } from "fs-extra";
import {
    api,
    createSoundWithCreatorAndSpeaker,
    createUserWithToken,
    createTag,
    tagSound,
    createSound,
    rateSound,
    getSound,
    startDb,
    stopDb,
} from "../../../test-utils";
import { world } from "../../scopes";
import { AudioCache } from "../../../server";
import { Token, Sound, Tag, User, CachedAudio } from "../../models";
import { ServerConfig } from "../../../config";

describe("sounds controller", () => {
    beforeEach(startDb);
    afterEach(stopDb);

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
                        enabled: true,
                        admin: false,
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

        it("responds 409 if already tagged with a tag", async () => {
            await tagSound(sound, tag, token);
            await api().post(`/sound/${sound.id}/tags`)
                .set("authorization", `Bearer ${token.id}`)
                .send({ id: tag.id });
            const response = await api().post(`/sound/${sound.id}/tags`)
                .set("authorization", `Bearer ${token.id}`)
                .send({ id: tag.id });
            expect(response.status).toBe(409);
            expect(response.body).toEqual({ message: `Sound was already tagged with tag "${tag.id}"` });
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

    describe("POST /sound/:id", () => {
        let token: Token, sound: Sound;

        beforeEach(async () => {
            token = (await createUserWithToken()).token;
            sound = (await createSoundWithCreatorAndSpeaker()).sound;
        });

        it("responds 401 without a valid token", async () => {
            const response = await api().post(`/sound/${sound.id}`);
            expect(response.status).toBe(401);
        });

        it("responds 401 for unknown sound without a valid token", async () => {
            const response = await api().post(`/sound/65888dad-7250-4756-bd8d-ed3375007405`);
            expect(response.status).toBe(401);
        });

        it("responds 404 for unknown sound", async () => {
            const response = await api().post(`/sound/65888dad-7250-4756-bd8d-ed3375007405`)
                .set("authorization", `Bearer ${token.id}`);
            expect(response.body).toEqual({ message: `No sound with id "65888dad-7250-4756-bd8d-ed3375007405"` });
            expect(response.status).toBe(404);
        });

        it("updates the description of the sound", async () => {
            const response = await api().post(`/sound/${sound.id}`)
                .set("authorization", `Bearer ${token.id}`)
                .send({ description: "Updated description" });
            expect(response.status).toBe(200);
            expect(response.body.data).toMatchObject({ description: "Updated description" });
            const updatedSoundResponse = await api().get(`/sound/${sound.id}`)
                .set("authorization", `Bearer ${token.id}`);
            const updateSound = updatedSoundResponse.body.data;
            expect(new Date(updateSound.updated) > new Date(sound.updated)).toBe(true);
            expect(updateSound.description).toBe("Updated description");
        });

        [
            "id",
            "used",
            "user",
            "source",
            "creator",
            "parent",
            "children",
            "created",
            "updated",
            "deleted",
            "soundTagRelations",
            "duration",
            "playlistEntrys",
            "ratings",
            "rating",
        ].forEach(field => {
            it(`responds 422 and does not update field "${field}"`, async () => {
                const response = await api().post(`/sound/${sound.id}`)
                    .set("authorization", `Bearer ${token.id}`)
                    .send({ [field]: "Something" });
                expect(response.status).toBe(422);
                const updatedSoundResponse = await api().get(`/sound/${sound.id}`)
                    .set("authorization", `Bearer ${token.id}`);
                const updateSound = updatedSoundResponse.body.data;
                expect(new Date(updateSound.updated)).toEqual(sound.updated);
                expect({
                    ...updateSound,
                    created: new Date(updateSound.created),
                    updated: new Date(updateSound.updated),
                }).toMatchObject({
                    ...sound,
                    user: pick(["admin", "avatarUrl", "enabled", "id", "name"], sound.user),
                    creator: pick(["admin", "avatarUrl", "enabled", "id", "name"], sound.creator),
                });
            });
        });
    });

    describe("DELETE /sound/:id", () => {
        let token: Token, sound: Sound;

        beforeEach(async () => {
            token = (await createUserWithToken()).token;
            sound = (await createSoundWithCreatorAndSpeaker()).sound;
        });

        it("responds 401 without a valid token", async () => {
            const response = await api().delete(`/sound/${sound.id}`);
            expect(response.status).toBe(401);
        });

        it("responds 401 for unknown sound without a valid token", async () => {
            const response = await api().delete(`/sound/65888dad-7250-4756-bd8d-ed3375007405`);
            expect(response.status).toBe(401);
        });

        it("responds 404 for unknown sound", async () => {
            const response = await api().delete(`/sound/65888dad-7250-4756-bd8d-ed3375007405`)
                .set("authorization", `Bearer ${token.id}`);
            expect(response.body).toEqual({ message: `No sound with id "65888dad-7250-4756-bd8d-ed3375007405"` });
            expect(response.status).toBe(404);
        });

        it("responds 400 if deleting a deleted sound", async () => {
            await api().delete(`/sound/${sound.id}`)
                .set("authorization", `Bearer ${token.id}`);
            const response = await api().delete(`/sound/${sound.id}`)
                .set("authorization", `Bearer ${token.id}`);
            expect(response.status).toBe(400);
        });

        it("sets the deleted timestamp on the sound", async () => {
            const response = await api().delete(`/sound/${sound.id}`)
                .set("authorization", `Bearer ${token.id}`);
            expect(response.status).toBe(200);
            const updatedSoundResponse = await api().get(`/sound/${sound.id}`)
                .set("authorization", `Bearer ${token.id}`);
            const updateSound = updatedSoundResponse.body.data;
            expect(updateSound.deleted).toBeTruthy();
        });
    });

    describe("GET /sounds", () => {
        let sounds: Sound[];
        let responseSounds: any[];
        let tags: Tag[];
        let userA: { token: Token, user: User };
        let userB: { token: Token, user: User };

        beforeEach(async () => {
            userA = await createUserWithToken({ name: "User A", email: "usera@example.com" } as User);
            userB = await createUserWithToken({ name: "User B", email: "userb@example.com" } as User);
            tags = [
                await createTag("Tag A", userA.token),
                await createTag("Tag B", userA.token),
            ];
            sounds = [
                await createSound({
                    description: "C First sound something",
                    creator: userA.user,
                    user: userA.user,
                    used: 100,
                    duration: 3.5,
                } as Sound),
                await createSound({
                    description: "A Second sound someone",
                    creator: userB.user,
                    user: userB.user,
                    used: 15,
                    duration: 3.2,
                } as Sound),
                await createSound({
                    description: "B Third sound anyone",
                    creator: userA.user,
                    user: userB.user,
                    used: 30,
                    source: "upload",
                    duration: 0.5,
                } as Sound),
            ];
            await tagSound(sounds[0], tags[0], userA.token);
            await tagSound(sounds[1], tags[0], userA.token);
            await tagSound(sounds[1], tags[1], userA.token);
            await tagSound(sounds[2], tags[1], userA.token);
            responseSounds = sounds.map(sound => ({
                ...sound,
                created: sound.created.toISOString(),
                updated: sound.updated.toISOString(),
                creator: {
                    ...omit(["email"], sound.creator),
                    enabled: true,
                    admin: sound.creator.id === userA.user.id,
                },
                user: {
                    ...omit(["email"], sound.user),
                    enabled: true,
                    admin: sound.user.id === userA.user.id,
                },
            }));
            await rateSound(sounds[0].id, userA.token.id, 2);
            await rateSound(sounds[0].id, userB.token.id, 4);
            await rateSound(sounds[1].id, userA.token.id, 1);
            await rateSound(sounds[2].id, userA.token.id, 2);
        });

        it("returns 401 without a valid token", async () => {
            const response = await api().get("/sounds");
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("returns all sounds without any parameters", async () => {
            const response = await api().get("/sounds")
                .set("authorization", `Bearer ${userA.token.id}`);
            expect(response.body).toMatchObject({
                data: {
                    totalSounds: 3,
                    sounds: responseSounds,
                },
            });
            expect(response.status).toBe(200);
        });

        it("returns all sounds matching a creator", async () => {
            const response = await api().get(`/sounds?creator=${userA.user.id}`)
                .set("authorization", `Bearer ${userA.token.id}`);
            expect(response.body.data).toMatchObject({
                totalSounds: 2,
                sounds: [ responseSounds[0], responseSounds[2] ],
            });
            expect(response.status).toBe(200);
        });

        it("returns all sounds matching a user", async () => {
            const response = await api().get(`/sounds?user=${userA.user.id}`)
                .set("authorization", `Bearer ${userA.token.id}`);
            expect(response.body.data).toMatchObject({
                sounds: [ responseSounds[0] ],
                totalSounds: 1,
            });
            expect(response.status).toBe(200);
        });

        describe("returns all sounds with specified tags", () => {
            it("matches the first tag", async () => {
                const response = await api().get(`/sounds?tags=${tags[0].id}`)
                    .set("authorization", `Bearer ${userA.token.id}`);
                expect(response.body.data).toMatchObject({
                    totalSounds: 2,
                    sounds: [ responseSounds[0], responseSounds[1] ],
                });
                expect(response.status).toBe(200);
            });

            it("matches the second tag", async () => {
                const response = await api().get(`/sounds?tags=${tags[1].id}`)
                    .set("authorization", `Bearer ${userA.token.id}`);
                expect(response.body.data).toMatchObject({
                    totalSounds : 2,
                    sounds: [ responseSounds[1], responseSounds[2] ],
                });
                expect(response.status).toBe(200);
            });

            it("matches both tags", async () => {
                const response = await api().get(`/sounds?tags=${tags[1].id},${tags[0].id}`)
                    .set("authorization", `Bearer ${userA.token.id}`);
                expect(response.body.data).toMatchObject({
                    totalSounds : 1,
                    sounds: [ responseSounds[1] ],
                });
                expect(response.status).toBe(200);
            });
        });

        it("returns all sounds matching a start date", async () => {
            const response = await api().get(`/sounds?startDate=${sounds[1].created.toISOString()}`)
                .set("authorization", `Bearer ${userA.token.id}`);
            expect(response.body.data).toMatchObject({
                totalSounds : 2,
                sounds: [ responseSounds[1], responseSounds[2] ],
            });
            expect(response.status).toBe(200);
        });

        it("returns all sounds matching an end date", async () => {
            const response = await api().get(`/sounds?endDate=${sounds[1].created.toISOString()}`)
                .set("authorization", `Bearer ${userA.token.id}`);
            expect(response.body.data).toMatchObject({
                totalSounds : 1,
                sounds: [ responseSounds[0] ],
            });
            expect(response.status).toBe(200);
        });

        it("returns all sounds matching a search string", async () => {
            const response = await api().get("/sounds?search=one")
                .set("authorization", `Bearer ${userA.token.id}`);
            expect(response.body.data).toMatchObject({
                totalSounds: 2,
                sounds: [ responseSounds[1], responseSounds[2] ],
            });
            expect(response.status).toBe(200);
        });

        it("returns all sounds matching a source", async () => {
            const response = await api().get("/sounds?source=upload")
                .set("authorization", `Bearer ${userA.token.id}`);
            expect(response.body.data).toMatchObject({
                totalSounds: 1,
                sounds: [ responseSounds[2] ],
            });
            expect(response.status).toBe(200);
        });

        it("sorts the sounds by updated", async () => {
            const response = await api().get("/sounds?sort=updated")
                .set("authorization", `Bearer ${userA.token.id}`);
            expect(response.body.data).toMatchObject({
                totalSounds: 3,
                sounds: [ responseSounds[0], responseSounds[1], responseSounds[2] ],
            });
            expect(response.status).toBe(200);
        });

        it("sorts the sounds by created", async () => {
            const response = await api().get("/sounds?sort=created")
                .set("authorization", `Bearer ${userA.token.id}`);
            expect(response.body.data).toMatchObject({
                totalSounds: 3,
                sounds: [ responseSounds[0], responseSounds[1], responseSounds[2] ],
            });
            expect(response.status).toBe(200);
        });

        it("sorts the sounds by duration", async () => {
            const response = await api().get("/sounds?sort=duration")
                .set("authorization", `Bearer ${userA.token.id}`);
            expect(response.body.data).toMatchObject({
                totalSounds: 3,
                sounds: [ responseSounds[2], responseSounds[1], responseSounds[0] ],
            });
            expect(response.status).toBe(200);
        });

        it("sorts the sounds by description", async () => {
            const response = await api().get("/sounds?sort=description")
                .set("authorization", `Bearer ${userA.token.id}`);
            expect(response.body.data).toMatchObject({
                totalSounds: 3,
                sounds: [ responseSounds[1], responseSounds[2], responseSounds[0] ],
            });
            expect(response.status).toBe(200);
        });

        it("sorts the sounds by usage count ascending", async () => {
            const response = await api().get("/sounds?sort=used&sortDirection=asc")
                .set("authorization", `Bearer ${userA.token.id}`);
            expect(response.body.data).toMatchObject({
                totalSounds: 3,
                sounds: [ responseSounds[1], responseSounds[2], responseSounds[0] ],
            });
            expect(response.status).toBe(200);
        });

        it("sorts the sounds by usage count descending", async () => {
            const response = await api().get("/sounds?sort=used&sortDirection=desc")
                .set("authorization", `Bearer ${userA.token.id}`);
            expect(response.body.data).toMatchObject({
                totalSounds: 3,
                sounds: [ responseSounds[0], responseSounds[2], responseSounds[1] ],
            });
            expect(response.status).toBe(200);
        });

        it("sorts the sounds by rating descending", async () => {
            const response = await api().get("/sounds?sort=rating&sortDirection=desc")
                .set("authorization", `Bearer ${userA.token.id}`);
            expect(response.body.data).toMatchObject({
                totalSounds: 3,
                sounds: [ responseSounds[0], responseSounds[2], responseSounds[1] ],
            });
            expect(response.status).toBe(200);
        });

        it("sorts the sounds by rating ascending", async () => {
            const response = await api().get("/sounds?sort=rating&sortDirection=asc")
                .set("authorization", `Bearer ${userA.token.id}`);
            expect(response.body.data).toMatchObject({
                totalSounds: 3,
                sounds: [ responseSounds[1], responseSounds[2], responseSounds[0] ],
            });
            expect(response.status).toBe(200);
        });

        it("with limit and offset", async () => {
            const response = await api().get("/sounds?sort=used&sortDirection=desc&limit=1&offset=1")
                .set("authorization", `Bearer ${userA.token.id}`);
            expect(response.body.data).toMatchObject({
                totalSounds: 3,
                limit: 1,
                offset: 1,
                sounds: [ responseSounds[2] ],
            });
            expect(response.status).toBe(200);
        });

        it("combined query", async () => {
            const response = await api().get("/sounds" +
                "?sort=used" +
                "&sortDirection=desc" +
                "&limit=1" +
                "&offset=0" +
                `&tags=${tags[0].id}` +
                "&search=some" +
                `&creator=${userA.user.id}`,
            ).set("authorization", `Bearer ${userA.token.id}`);
            expect(response.body.data).toMatchObject({
                totalSounds: 1,
                limit: 1,
                offset: 0,
                sounds: [ responseSounds[0] ],
            });
            expect(response.status).toBe(200);
        });
    });

    describe("POST /sounds/youtube", () => {
        let user: User, token: Token;

        beforeEach(async () => {
            const userAndToken = await createUserWithToken();
            user = userAndToken.user;
            token = userAndToken.token;
        });

        it("returns 401 without a valid token", async () => {
            const response = await api().post("/sounds/youtube");
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("returns 400 with an invalid youtube url", async () => {
            const response = await api().post("/sounds/youtube")
                .set("authorization", `Bearer ${token.id}`)
                .send({
                    url: "https://example.com/broken",
                });
            expect(response.body).toEqual({ message: "Could not gather meta information about provided URL." });
            expect(response.status).toBe(400);
        });

        it("returns 400 if an error occurs while downloading the video", async () => {
            const response = await api().post("/sounds/youtube")
                .set("authorization", `Bearer ${token.id}`)
                .send({
                    url: "https://example.com/error",
                });
            expect(response.body).toEqual({ message: "Connection to YouTube interrupted." });
            expect(response.status).toBe(400);
        });

        it("returns 400 if a broken file was downloaded", async () => {
            const response = await api().post("/sounds/youtube")
                .set("authorization", `Bearer ${token.id}`)
                .send({
                    url: "https://example.com/garbage",
                });
            expect(response.body).toEqual({ message: "Unable to process meta information for downloaded file." });
            expect(response.status).toBe(400);
        });

        it("downloads the video and creates a new sound", async () => {
            const response = await api().post("/sounds/youtube")
                .set("authorization", `Bearer ${token.id}`)
                .send({
                    url: "https://example.com/working",
                });
            expect(response.status).toBe(201);
            expect(response.body.data).toMatchObject({
                description: "Some video",
                used: 0,
                source: "youtube",
                deleted: null,
                duration: 1.201633,
                creator: { id: user.id },
                user: null,
                soundTagRelations: [],
                parent: null,
                children: [],
                rating: 0,
            });
        });
    });

    describe("POST /sounds/upload", () => {
        let user: User, token: Token;

        beforeEach(async () => {
            const userAndToken = await createUserWithToken();
            user = userAndToken.user;
            token = userAndToken.token;
        });

        it("returns 401 without a valid token", async () => {
            const response = await api().post("/sounds/upload");
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("returns 400 with a bad audio file", async () => {
            const response = await api().post("/sounds/upload")
                .set("authorization", `Bearer ${token.id}`)
                .send({
                    filename: "some-file.mp3",
                    content: readFileSync(`${__dirname}/../../../__fixtures__/garbage`).toString("base64"),
                });
            expect(response.body).toEqual({ message: "Unable to process meta information for upload" });
            expect(response.status).toBe(400);
        });

        it("returns 400 with invalid base64", async () => {
            const response = await api().post("/sounds/upload")
                .set("authorization", `Bearer ${token.id}`)
                .send({
                    filename: "some-file.mp3",
                    content: "this is not valid base64 :-(",
                });
            expect(response.body).toEqual({ message: "Unable to process meta information for upload" });
            expect(response.status).toBe(400);
        });

        it("creates a new sound", async () => {
            const response = await api().post("/sounds/upload")
                .set("authorization", `Bearer ${token.id}`)
                .send({
                    filename: "some-file.mp3",
                    content: readFileSync(`${__dirname}/../../../__fixtures__/test.mp3`).toString("base64"),
                });
            expect(response.status).toBe(201);
            expect(response.body.data).toMatchObject({
                description: "some-file.mp3",
                used: 0,
                source: "upload",
                deleted: null,
                duration: 1.201633,
                creator: { id: user.id },
                user: null,
                soundTagRelations: [],
                parent: null,
                children: [],
                rating: 0,
            });
        });
    });

    describe("POST /sounds", () => {
        let user: User, token: Token, cachedAudio: CachedAudio;

        beforeEach(async () => {
            const userAndToken = await createUserWithToken();
            user = userAndToken.user;
            token = userAndToken.token;
            cachedAudio = populate(world, CachedAudio, {
                date: new Date("2018-11-15Z10:00:00"),
                user,
                id: "0edf2ba3-d372-4ccf-8b85-f475423747cb",
                duration: 15,
                amplitude: 38,
            });
            await copy(
                `${__dirname}/../../../__fixtures__/test.mp3`,
                `${tsdi.get(ServerConfig).tmpDir}/${cachedAudio.id}`,
            );
            await tsdi.get(AudioCache).add(cachedAudio);
        });

        it("returns 401 without a valid token", async () => {
            const response = await api().post("/sounds");
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("returns 400 with an unkown cached audio", async () => {
            const response = await api().post("/sounds")
                .set("authorization", `Bearer ${token.id}`)
                .send({ id: "f2a0abc7-0afe-4553-9d12-f675f95a9ab0" });
            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                message: `No cached sound with id "f2a0abc7-0afe-4553-9d12-f675f95a9ab0" found.`,
            });
        });

        it("creates a new sound", async () => {
            const response = await api().post("/sounds")
                .set("authorization", `Bearer ${token.id}`)
                .send({ id: cachedAudio.id });
            expect(response.status).toBe(201);
            expect(response.body.data).toMatchObject({
                used: 0,
                source: "recording",
                deleted: null,
                duration: 15,
                creator: { id: user.id },
                user: { id: user.id },
                soundTagRelations: [],
                parent: null,
                children: [],
                rating: 0,
            });
        });
    });

    describe("POST /sound/:id/fork", () => {
        let token: Token, sound: Sound, user: User, speaker: User;

        beforeEach(async () => {
            const userAndToken = await createUserWithToken();
            token = userAndToken.token;
            user = userAndToken.user;
            const soundAndSpeaker = await createSoundWithCreatorAndSpeaker();
            sound = soundAndSpeaker.sound;
            speaker = soundAndSpeaker.speaker;
            await copy(
                `${__dirname}/../../../__fixtures__/test.mp3`,
                `${tsdi.get(ServerConfig).soundsDir}/${sound.id}`,
            );
        });

        it("returns 401 without a valid token", async () => {
            const response = await api().post(`/sound/${sound.id}/fork`);
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("returns 404 with an unknown sound and no valid token", async () => {
            const response = await api().post(`/sound/953fac26-f2a2-484d-9743-79779be7ec14/fork`);
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("returns 404 with an unknown sound", async () => {
            const response = await api().post(`/sound/953fac26-f2a2-484d-9743-79779be7ec14/fork`)
                .set("authorization", `Bearer ${token.id}`)
                .send({
                    description: "New description",
                    actions: [
                        { action: "crop", start: 1, end: 2 },
                    ],
                    overwrite: true,
                });
            expect(response.body).toEqual({ message: `No sound with id "953fac26-f2a2-484d-9743-79779be7ec14".` });
            expect(response.status).toBe(404);
        });

        [true, false].forEach(overwrite => {
            it(`creates a new sound and ${overwrite ? "deletes" : "doesn't delete"} the old sound`, async () => {
                const response = await api().post(`/sound/${sound.id}/fork`)
                    .set("authorization", `Bearer ${token.id}`)
                    .send({
                        description: "New description",
                        actions: [ { action: "crop", start: 0.2, end: 0.4 } ],
                        overwrite,
                    });
                expect(response.status).toBe(201);
                expect(response.body.data).toMatchObject({
                    description: "New description",
                    used: 0,
                    source: "recording",
                    deleted: null,
                    duration: 0.2,
                    creator: { id: user.id },
                    user: { id: speaker.id },
                    soundTagRelations: [],
                    parent: { id: sound.id },
                    children: [],
                    rating: 0,
                });
                const oldSoundResponse = await api().get(`/sound/${sound.id}`)
                    .set("authorization", `Bearer ${token.id}`);
                expect(oldSoundResponse.body.data).toMatchObject({
                    children: [ { id: response.body.data.id } ],
                });
                expect(Boolean(oldSoundResponse.body.data.deleted)).toBe(overwrite);
            });
        });
    });

    describe("POST /sound/:id/ratings", () => {
        let users: { user: User, token: Token }[];
        let sound: Sound;
        beforeEach(async () => {
            users = [];
            const soundAndCreator = await createSoundWithCreatorAndSpeaker();
            sound = soundAndCreator.sound;
            for (let i = 0; i < 5; ++i) {
                users.push(await createUserWithToken({
                    name: `Rater ${i}`,
                    email: `rater-${i}@example.com`,
                } as User));
            }
        });

        it("rating a sound", async () => {
            expect((await getSound(sound.id, users[0].token.id)).rating).toBe(0);
            // Initial rating.
            const response = await rateSound(sound.id, users[0].token.id, 2);
            expect(response.status).toBe(201);
            expect(response.body.data).toMatchObject({ id: sound.id, rating: 2 });
            expect((await getSound(sound.id, users[0].token.id)).rating).toBe(2);
            // Second rating.
            await rateSound(sound.id, users[1].token.id, 4);
            expect((await getSound(sound.id, users[1].token.id)).rating).toBe(3);
            // Third rating.
            await rateSound(sound.id, users[2].token.id, 3);
            expect((await getSound(sound.id, users[2].token.id)).rating).toBe(3);
            // Fourth rating.
            await rateSound(sound.id, users[3].token.id, 5);
            expect((await getSound(sound.id, users[3].token.id)).rating).toBe(3.5);
            // Fifth rating.
            await rateSound(sound.id, users[4].token.id, 1);
            expect((await getSound(sound.id, users[4].token.id)).rating).toBe(3);
        });

        it("updating a rating", async () => {
            // Initial rating.
            const firstRating = await rateSound(sound.id, users[0].token.id, 2);
            expect(firstRating.status).toBe(201);
            expect(firstRating.body.data).toMatchObject({ id: sound.id, rating: 2 });
            expect((await getSound(sound.id, users[0].token.id)).rating).toBe(2);
            // Second rating.
            await rateSound(sound.id, users[1].token.id, 4);
            expect((await getSound(sound.id, users[1].token.id)).rating).toBe(3);
            // Update first rating.
            const secondRating = await rateSound(sound.id, users[0].token.id, 5);
            expect(secondRating.status).toBe(200);
            expect(secondRating.body.data).toMatchObject({ id: sound.id, rating: 4.5 });
            expect((await getSound(sound.id, users[0].token.id)).rating).toBe(4.5);
        });
    });
});
