import { api } from "./api";
import { createUser } from "./user";
import { User } from "../common";

export async function createUserWithToken(data?: User) {
    const user = await createUser(data);
    const response = await api().post("/token")
        .send({
            password: "some secure password",
            email: user.email,
        });
    const token = response.body.data;
    return { token, user };
}
