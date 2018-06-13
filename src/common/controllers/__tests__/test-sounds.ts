import { omit, pick } from "ramda";
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
import { Token, Sound, Tag, User } from "../..";

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
