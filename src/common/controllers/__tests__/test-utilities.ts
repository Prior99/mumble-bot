import { api, createUserWithToken, startDb, stopDb } from "../../../test-utils";

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
});
