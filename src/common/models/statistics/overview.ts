import { is, scope, specify } from "hyrest";
import { statistics } from "../../scopes";

export class StatisticOverview {
    @is() @scope(statistics)
    public totalSounds: number;

    @is() @scope(statistics)
    public totalUsers: number;

    @is() @scope(statistics)
    public totalUnrated: number;

    @is() @scope(statistics)
    public totalUntagged: number;

    @is() @scope(statistics) @specify(() => Date)
    public oldestSound: Date;

    @is() @scope(statistics)
    public totalTags: number;

    @is() @scope(statistics)
    public totalTagged: number;

    @is() @scope(statistics)
    public totalPlaybacks: number;
}
