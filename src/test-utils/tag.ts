import { api } from "./api";
import { Tag, Sound, Token } from "../common";

export async function createTag(name: string, token: Token) {
    const response = await api().post("/tag")
        .set("authorization", `Bearer ${token.id}`)
        .send({ name });
    return response.body.data;
}

export async function tagSound(sound: Sound, tag: Tag, token: Token) {
    const response = await api().post(`/sound/${sound.id}/tags`)
        .set("authorization", `Bearer ${token.id}`)
        .send({ id: tag.id });
    return response.body.data;
}
