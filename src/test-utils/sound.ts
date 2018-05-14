import { Sound, User } from "../common";
import { Connection } from "typeorm";
import { createUser } from "./user";

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
