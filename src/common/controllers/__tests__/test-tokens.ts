import { Connection } from "typeorm";
import { api, createUser, startDb, stopDb } from "../../../test-utils/";
import { User, Token } from "../..";

describe("tokens controller", () => {
    beforeEach(startDb);
    afterEach(stopDb);

    let user: User, disabledUser;

    beforeEach(async () => {
        user = await createUser({
            name: "someone",
            email: "someone@example.com",
            password: "somepassword",
        } as User);
        disabledUser = await createUser({
            name: "disabled",
            email: "disabled@example.com",
            password: "somepassword",
        } as User, false);
    });

    describe("POST /token", () => {
        it("responds 401 with invalid password", async () => {
            const response = await api().post("/token")
                .send({
                    email: "someone@example.com",
                    password: "wrongpassword",
                });
            expect(response.body).toEqual({ message: "Invalid credentials." });
            expect(response.status).toBe(401);
        });

        it("responds 401 with invalid email", async () => {
            const response = await api().post("/token")
                .send({
                    email: "wronguser@example.com",
                    password: "somepassword",
                });
            expect(response.body).toEqual({ message: "Invalid credentials." });
            expect(response.status).toBe(401);
        });

        it("responds 401 with a disabled user", async () => {
            const response = await api().post("/token")
                .send({
                    email: "disabled@example.com",
                    password: "somepassword",
                });
            expect(response.body).toEqual({ message: "User is disabled." });
            expect(response.status).toBe(401);
        });

        it("creates a new valid token", async () => {
            const response = await api().post("/token")
                .send({
                    email: "someone@example.com",
                    password: "somepassword",
                });
            const token = response.body.data;
            const getResponse = await api().get(`/user/${user.id}`)
                .set("authorization", `Bearer ${token.id}`);
            expect(getResponse.status).toBe(200);
        });
    });
});
