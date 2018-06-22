import { copy } from "fs-extra";
import { api, createUserWithToken, startDb, stopDb, createSoundWithCreatorAndSpeaker } from "../../../test-utils";
import { Token, Sound } from "../../models";
import { AudioOutput } from "../../../server";
import { ServerConfig } from "../../../config";

describe("utilities controller", () => {
    beforeEach(startDb);
    afterEach(stopDb);

    describe("GET /channel-tree", () => {
        it("responds 401 without a valid token", async () => {
            const response = await api().get("/channel-tree");
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("fetches a tree of the server's channels", async () => {
            const { token } = await createUserWithToken();
            const response = await api().get("/channel-tree")
                .set("authorization", `Bearer ${token.id}`);
            expect(response.body).toMatchSnapshot();
            expect(response.status).toBe(200);
        });
    });

    describe("GET /mumble-users", () => {
        it("responds 401 without a valid token", async () => {
            const response = await api().get("/mumble-users");
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("fetches a list of connected mumble users", async () => {
            const { token } = await createUserWithToken();
            const response = await api().get("/mumble-users")
                .set("authorization", `Bearer ${token.id}`);
            expect(response.body).toEqual({
                data: [
                    {
                        id: 4,
                        name: "Stranger one",
                        session: 84,
                    }, {
                        id: 7,
                        name: "Stranger two",
                        session: 171,
                    }, {
                        id: 23,
                        name: "Stranger three",
                        session: 2134,
                    },
                ],
            });
            expect(response.status).toBe(200);
        });
    });

    describe("POST /shut-up", () => {
        let sound: Sound, token: Token;

        beforeEach(async () => {
            const userAndToken = await createUserWithToken();
            token = userAndToken.token;
            sound = (await createSoundWithCreatorAndSpeaker({ duration: 1 } as Sound)).sound;
            await copy(
                `${__dirname}/../../../__fixtures__/sin-short.mp3`,
                `${tsdi.get(ServerConfig).soundsDir}/${sound.id}`,
            );
            for (let i = 0; i < 10; ++i) {
                await api().post(`/queue`)
                    .set("authorization", `Bearer ${token.id}`)
                    .send({
                        type: "sound",
                        sound: { id: sound.id },
                        pitch: 0,
                    });
            }
        });

        it("responds 401 without a valid token", async () => {
            const response = await api().post("/shut-up");
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("clears the queue", async () => {
            const response = await api().post("/shut-up")
                .set("authorization", `Bearer ${token.id}`);
            expect(response.status).toBe(200);
            expect(tsdi.get(AudioOutput).queue.length).toBe(0);
        });
    });
});
