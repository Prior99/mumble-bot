import { is, DataType, scope, specify } from "hyrest";
import { Playlist } from "./playlist";
import { world, listPlaylists } from "../scopes";

export class PlaylistsQueryResult {
    @is(DataType.int) @scope(world, listPlaylists)
    public totalPlaylists: number;

    @is(DataType.int) @scope(world, listPlaylists)
    public limit: number;

    @is(DataType.int) @scope(world, listPlaylists)
    public offset: number;

    @is() @scope(world, listPlaylists) @specify(() => Playlist)
    public playlists: Playlist[];
}
