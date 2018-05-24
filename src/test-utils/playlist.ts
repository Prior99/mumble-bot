import { Sound, User, Playlist, PlaylistEntry } from "../common";
import { Connection } from "typeorm";

const defaultPlaylist = {
    name: "A Playlist",
};

export async function createPlaylist(creator: User, pitch: number, ...sounds: Sound[]) {
    const playlist = await tsdi.get(Connection).getRepository(Playlist).save(Object.assign(new Playlist(), {
        ...defaultPlaylist,
        creator,
    }));
    await Promise.all(sounds.map(async (sound, position) => {
        await tsdi.get(Connection).getRepository(PlaylistEntry).save({
            sound, position, playlist, pitch,
        });
    }));
    return await tsdi.get(Connection).getRepository(Playlist).findOne({
        where: { id: playlist.id },
        relations: ["creator", "entries", "entries.sound"],
    });
}
