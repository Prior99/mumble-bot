import { Sound, User } from "../common";
import { Connection } from "typeorm";
import { createUser } from "./user";
import { api } from "./api";

const defaultSound = {
    description: "Some sound",
    used: 17,
    source: "recording",
    duration: 13,
};

export async function createSound(sound?: Sound) {
    return await tsdi.get(Connection).getRepository(Sound).save({ ...defaultSound, ...sound } as Sound);
}

export async function createSoundWithCreatorAndSpeaker(data?: Sound) {
    const user = await createUser({ name: "Speaker", email: "speaker@example.com" } as User);
    const creator = await createUser({ name: "Creator", email: "creator@example.com" } as User);
    const sound = await createSound({ ...data, user, creator });
    return { sound, creator, speaker: user };
}

export async function getSound(id: string, token: string) {
    const response = await api().get(`/sound/${id}`)
        .set("authorization", `Bearer ${token}`);
    return response.body.data;
}

export async function rateSound(id: string, token: string, stars: number) {
    return await api().post(`/sound/${id}/ratings`)
        .set("authorization", `Bearer ${token}`)
        .send({ stars });
}
