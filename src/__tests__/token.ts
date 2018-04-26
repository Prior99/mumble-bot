import { api } from "./api";
import { createUser } from "./user";

export async function createUserWithToken(data?: DatabaseUser) {
    const user = await createUser(data);
    const response = await api().post("/token")
        .send({
            password: "some secure password",
            email: user.email,
        });
    const token = response.body.data;
    return { token, user };
}
