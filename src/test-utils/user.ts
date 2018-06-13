import { Connection } from "typeorm";
import { api } from "./api";
import { User } from "../common";

const defaultUser = {
    name: "someone",
    email: "some@example.com",
    password: "some secure password",
};

export async function createUser(data?: User, enable = true, admin = false) {
    const response = await api().post("/user").send({ ...defaultUser, ...data });
    const user = response.body.data;
    if (enable) {
        await tsdi.get(Connection).getRepository(User).update(user.id, { enabled: true });
        user.enabled = true;
    }
    if (admin) {
        await tsdi.get(Connection).getRepository(User).update(user.id, { admin: true });
        user.admin = true;
    }
    return user;
}
