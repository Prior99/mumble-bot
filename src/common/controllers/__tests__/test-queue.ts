import { copy } from "fs-extra";
import { fft, util } from "fft-js";
import { populate } from "hyrest";
import { Connection } from "mumble";
import {
    api,
    createPlaylist,
    createUserWithToken,
    createSoundWithCreatorAndSpeaker,
    startDb,
    stopDb,
} from "../../../test-utils";
import { world } from "../../scopes";
import { Token, User, Sound, CachedAudio } from "../../models";
import { AudioOutput, AudioCache } from "../../../server";
import { ServerConfig } from "../../../config";

describe("queue controller", () => {
    let token: Token;
    let user: User;
    let sound: Sound;
    let mumble: Connection;
    let audioOutput: AudioOutput;
    let voice: number[];

    beforeEach(startDb);
    afterEach(stopDb);

    beforeEach(async () => {
        const userAndToken = await createUserWithToken();
        token = userAndToken.token;
        user = userAndToken.user;
        sound = (await createSoundWithCreatorAndSpeaker({ duration: 1 } as Sound)).sound;
        await copy(
            `${__dirname}/../../../__fixtures__/sin-short.mp3`,
            `${tsdi.get(ServerConfig).soundsDir}/${sound.id}`,
        );
        mumble = tsdi.get("MumbleConnection");
        audioOutput = tsdi.get(AudioOutput);

        voice = [];
        mumble.inputStream().on("data", (data: Buffer) => {
            for (let i = 0; i < data.length; i += 2) {
                const num = data.readInt16LE(i);
                voice.push((num / Math.pow(2, 16)) * 2 - 1);
            }
        });
    });

    describe("POST /queue", () => {
        it("responds 401 without a valid token", async () => {
            const response = await api().post("/queue");
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        describe(`with type="sound"`, () => {
            it("enqueues a sound", async done => {
                const requestQueueItem = {
                    type: "sound",
                    sound: { id: sound.id },
                    pitch: 50,
                };
                const response = await api().post(`/queue`)
                    .set("authorization", `Bearer ${token.id}`)
                    .send(requestQueueItem);
                expect(response.status).toBe(201);
                const resultQueueItem = {
                    ...requestQueueItem,
                    user: { id: user.id },
                };
                expect(response.body).toMatchObject({ data: resultQueueItem });
                const updatedSoundResponse = await api().get(`/sound/${sound.id}`)
                    .set("authorization", `Bearer ${token.id}`);
                expect(updatedSoundResponse.body.data.used).toBe(sound.used + 1);
                audioOutput.once("shift", item => {
                    expect(voice.length).toMatchSnapshot();
                    expect(item).toMatchObject(resultQueueItem);
                    done();
                });
            });
        });

        describe(`with type="cached audio"`, () => {
            it("enqueues a cached audio", async done => {
                const cachedAudio = {
                    date: new Date("2018-11-15Z10:00:00"),
                    user,
                    id: "0edf2ba3-d372-4ccf-8b85-f475423747cb",
                    duration: 15,
                    amplitude: 38,
                };
                await copy(
                    `${__dirname}/../../../__fixtures__/sin-short.mp3`,
                    `${tsdi.get(ServerConfig).tmpDir}/${cachedAudio.id}`,
                );
                await tsdi.get(AudioCache).add(populate(world, CachedAudio, cachedAudio));
                const requestQueueItem = {
                    type: "cached audio",
                    cachedAudio: { id: cachedAudio.id },
                    pitch: 50,
                };
                const response = await api().post(`/queue`)
                    .set("authorization", `Bearer ${token.id}`)
                    .send(requestQueueItem);
                expect(response.status).toBe(201);
                const resultQueueItem = {
                    ...requestQueueItem,
                    user: { id: user.id },
                };
                expect(response.body).toMatchObject({ data: resultQueueItem });
                audioOutput.once("shift", item => {
                    expect(voice.length).toMatchSnapshot();
                    expect(item).toMatchObject(resultQueueItem);
                    done();
                });
            });
        });

        describe(`with type="playlist"`, () => {
            it("enqueues a playlist", async done => {
                const playlist = await createPlaylist(user, 0, sound, sound);
                const requestQueueItem = {
                    type: "playlist",
                    playlist: { id: playlist.id },
                    pitch: 50,
                };
                const response = await api().post(`/queue`)
                    .set("authorization", `Bearer ${token.id}`)
                    .send(requestQueueItem);
                expect(response.status).toBe(201);
                const resultQueueItem = {
                    ...requestQueueItem,
                    user: { id: user.id },
                };
                expect(response.body).toMatchObject({ data: resultQueueItem });
                audioOutput.once("shift", item => {
                    expect(voice.length).toMatchSnapshot();
                    expect(item).toMatchObject(resultQueueItem);
                    done();
                });
            });

            [-200, 600].forEach(pitch => {
                it(`enqueues a playlist with pitch ${pitch}`, async done => {
                    const playlist = await createPlaylist(user, pitch, sound, sound);
                    const requestQueueItem = {
                        type: "playlist",
                        playlist: { id: playlist.id },
                    };
                    const response = await api().post(`/queue`)
                        .set("authorization", `Bearer ${token.id}`)
                        .send(requestQueueItem);
                    expect(response.status).toBe(201);
                    const resultQueueItem = {
                        ...requestQueueItem,
                        user: { id: user.id },
                    };
                    expect(response.body).toMatchObject({ data: resultQueueItem });
                    audioOutput.once("shift", item => {
                        expect(voice.length).toMatchSnapshot();
                        const phasors = fft(voice.slice(0, Math.pow(2, 15)));
                        const frequencies = util.fftFreq(phasors, 48000);
                        const magnitudes = util.fftMag(phasors);
                        let highest: number;
                        let highestIndex: number;
                        for (let i = 1; i < magnitudes.length; ++i) {
                            if (highest === undefined || magnitudes[i] > highest) {
                                highest = magnitudes[i];
                                highestIndex = i;
                            }
                        }
                        expect({
                            magnitude: Math.round(highest),
                            frequency: Math.round(frequencies[highestIndex]),
                        }).toMatchSnapshot();
                        expect(item).toMatchObject(resultQueueItem);
                        done();
                    });
                });
            });
        });
    });
});
