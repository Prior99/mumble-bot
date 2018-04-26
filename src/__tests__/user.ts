import { api } from "./api";
import { User } from "../common";

const defaultUser = {
    name: "someone",
    email: "some@example.com",
    password: "some secure password",
};

export async function createUser(data?: User) {
    const response = await api().post("/user").send({ ...defaultUser, ...data });
    return response.body.data;
}
