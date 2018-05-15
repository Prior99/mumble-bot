import { omit } from "ramda";
import { populate } from "hyrest";
import {
    api,
    createSoundWithCreatorAndSpeaker,
    createUserWithToken,
    createTag,
    tagSound,
    createSound,
} from "../../../test-utils";
import { world } from "../../scopes";
import { AudioCache } from "../../../server";
import { Token, Sound, Tag, User, CachedAudio } from "../../models";

describe("cached controller", () => {
    let user: User;
    let token: Token;
    let cachedAudio1: CachedAudio, cachedAudio2: CachedAudio;

    beforeEach(async () => {
        const userAndToken = await createUserWithToken();
        user = userAndToken.user;
        token = userAndToken.token;
        cachedAudio1 = {
            date: new Date("2018-11-15Z10:00:00"),
            user,
            id: "0edf2ba3-d372-4ccf-8b85-f475423747cb",
            duration: 15,
            amplitude: 38,
        };
        cachedAudio2 = {
            date: new Date("2018-11-17Z10:00:00"),
            user,
            id: "33dbd756-83de-4f28-b7af-dc52a114fb90",
            duration: 35,
            amplitude: 43,
        };
        await tsdi.get(AudioCache).add(populate(world, CachedAudio, cachedAudio1));
        await tsdi.get(AudioCache).add(populate(world, CachedAudio, cachedAudio2));
    });

    describe("GET /cached", () => {
        it("responds 401 without a valid token", async () => {
            const response = await api().get(`/cached`);
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("fetches a list of all cached audios", async () => {
            const response = await api().get(`/cached`)
                .set("authorization", `Bearer ${token.id}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                data: [
                    {
                        ...cachedAudio1,
                        date: cachedAudio1.date.toISOString(),
                        user: omit(["email"], cachedAudio1.user),
                    }, {
                        ...cachedAudio2,
                        date: cachedAudio2.date.toISOString(),
                        user: omit(["email"], cachedAudio2.user),
                    },
                ],
            });
        });
    });

    describe("DELETE /cached/:id", () => {
        it("responds 401 without a valid token", async () => {
            const response = await api().delete(`/cached/${cachedAudio1.id}`);
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("responds 401 without a valid token with unkown id", async () => {
            const response = await api().delete(`/cached/89c11873-8691-4196-9d18-be9df458b5f2`);
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("deletes the cached audio", async () => {
            const responseDelete = await api().delete(`/cached/${cachedAudio1.id}`)
                .set("authorization", `Bearer ${token.id}`);
            expect(responseDelete.status).toBe(200);
            const responseGet = await api().get(`/cached`)
                .set("authorization", `Bearer ${token.id}`);
            expect(responseGet.body).toEqual({
                data: [
                    {
                        ...cachedAudio2,
                        date: cachedAudio2.date.toISOString(),
                        user: omit(["email"], cachedAudio2.user),
                    },
                ],
            });
            expect(responseGet.status).toBe(200);
        });
    });
});
