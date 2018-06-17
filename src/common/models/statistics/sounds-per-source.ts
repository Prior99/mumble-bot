import { is, scope, specify, uuid } from "hyrest";
import { statistics } from "../../scopes";
import { Source } from "../sound";

export class SoundsPerSingleSource {
    @is().validate(uuid) @scope(statistics)
    public source: Source;

    @is() @scope(statistics)
    public sounds: number;
}

export class StatisticSoundsPerSource {
    @is() @scope(statistics) @specify(() => SoundsPerSingleSource)
    public soundsPerSource: SoundsPerSingleSource[];
}
