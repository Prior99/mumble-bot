import { pick } from "ramda";
import { api, createUserWithToken, createUser } from "../../../__tests__";
import { MumbleFactory } from "../../../server";

describe("utilities controller", () => {
    describe("GET /mumble-users", () => {
        it("responds 401 without a valid token", async () => {
            const response = await api().get("/mumble-users");
            expect(response.body).toEqual({ message: "Unauthorized." });
            expect(response.status).toBe(401);
        });

        it("fetches a list of connected mumble users", async () => {
            const { user, token } = await createUserWithToken();
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
