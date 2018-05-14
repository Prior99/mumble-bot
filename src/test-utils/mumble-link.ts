import { api } from "./api";

export async function linkMumbleUser(userId: string, tokenId: string, mumbleId: number) {
    const response = await api().post("/mumble-link")
        .set("authorization", `Bearer ${tokenId}`)
        .send({
            mumbleId,
            user: {
                id: userId,
            },
        });
    return response.body.data;
}
