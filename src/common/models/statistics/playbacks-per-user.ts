import { is, scope, specify, uuid } from "hyrest";
import { statistics } from "../../scopes";
import { User } from "../user";

export class PlaybacksPerSingleUser {
    @is().validate(uuid) @scope(statistics)
    public user: User;

    @is() @scope(statistics)
    public playbacks: number;
}

export class StatisticPlaybacksPerUser {
    @is() @scope(statistics) @specify(() => PlaybacksPerSingleUser)
    public playbacksPerUser: PlaybacksPerSingleUser[];
}
