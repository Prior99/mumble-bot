import { Connection } from "typeorm";
import {
    api,
    createUserWithTokenManually,
    startDb,
    stopDb,
    createTag,
    createUserManually,
    createSound,
    tagSound,
    rateSound,
} from "../../../test-utils";
import { Token, User, Sound } from "../../models";

describe("statistics controller", () => {
    beforeEach(startDb);
    afterEach(stopDb);

    let token: Token;

    beforeEach(async () => {
        const userAndToken = await createUserWithTokenManually({
            id: "bc919169-6e7a-4ad8-a5c9-7e0b4f932b1e",
        } as User);
        token = userAndToken.token;
    });

    async function insertMockData() {
        const tag1 = await createTag("Tag 1", token);
        const tag2 = await createTag("Tag 2", token);
        const user1 = await createUserManually({
            id: "2ce5e078-b52e-4d50-90cc-1703ec08ef2f",
            name: "User 1",
            email: "user1@example.com",
        } as User);
        const user2 = await createUserManually({
            id: "9e1d01d6-a203-4c86-9074-ee5e05a57dcd",
            name: "User 2",
            email: "user2@example.com",
        } as User);
        const sound1 = await createSound({
            description: "Some sound 1",
            user: user1,
            creator: user2,
            used: 100,
        } as Sound);
        await tsdi.get(Connection).getRepository(Sound).update(sound1.id, {
            created: new Date("2017-01-15T20:00:00"),
        });
        const sound2 = await createSound({
            description: "Some sound 2",
            user: user2,
            creator: user1,
            used: 900,
        } as Sound);
        await tsdi.get(Connection).getRepository(Sound).update(sound2.id, {
            created: new Date("2018-01-15T20:00:00"),
        });
        await tagSound(sound1, tag1, token);
        await tagSound(sound1, tag2, token);
        await rateSound(sound1.id, token.id, 2);
    }

    [
        "/statistics/overview",
        "/statistics/creations-per-user",
        "/statistics/playbacks-per-user",
        "/statistics/recordings-per-user",
        "/statistics/sounds-per-source",
        "/statistics/sounds-per-month",
    ].forEach(url => {
        describe(`GET ${url}`, () => {
            it("responds 401 with no valid token", async () => {
                const response = await api().get(url);
                expect(response.status).toBe(401);
            });

            it("responds 200 and the expected result with an empty database", async () => {
                const response = await api().get(url)
                    .set("authorization", `Bearer ${token.id}`);
                expect(response.status).toBe(200);
                expect(response.body.data).toMatchSnapshot();
            });

            it("responds 200 and the expected result with data in the database", async () => {
                await insertMockData();
                const response = await api().get(url)
                    .set("authorization", `Bearer ${token.id}`);
                expect(response.status).toBe(200);
                expect(response.body.data).toMatchSnapshot();
            });
        });
    });
});
