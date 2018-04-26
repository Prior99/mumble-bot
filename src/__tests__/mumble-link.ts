import { api } from "./api";
import { User } from "../common";

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
