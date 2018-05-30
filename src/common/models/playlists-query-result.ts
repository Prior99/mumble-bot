import { is, DataType, scope, specify } from "hyrest";
import { Playlist } from "./playlist";
import { world } from "../scopes";

export class PlaylistsQueryResult {
    @is(DataType.int) @scope(world)
    public totalPlaylists: number;

    @is(DataType.int) @scope(world)
    public limit: number;

    @is(DataType.int) @scope(world)
    public offset: number;

    @is() @scope(world) @specify(() => Playlist)
    public playlists: Playlist[];
}
