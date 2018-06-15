import { api, createUserWithToken, startDb, stopDb } from "../../../test-utils";

describe("validation controller", () => {
    beforeEach(startDb);
    afterEach(stopDb);

    describe("POST /validate/user/name", () => {
        it("responds 200 with no error for unknown name", async () => {
            const response = await api().post("/validate/user/name")
                .set("content-type", "application/json")
                .send(JSON.stringify("somenamewhichshouldnotbetaken"));
            expect(response.body.data).toEqual({});
            expect(response.status).toBe(200);
        });

        it("responds 200 with no error for unknown name", async () => {
            const { user } = await createUserWithToken();
            const response = await api().post("/validate/user/name")
                .set("content-type", "application/json")
                .send(JSON.stringify(user.name));
            expect(response.body.data).toEqual({ error: "Name already taken." });
            expect(response.status).toBe(200);
        });
    });
});
