import { is, scope, specify } from "hyrest";
import { statistics } from "../../scopes";

export class SoundsPerSingleMonth {
    @is() @scope(statistics) @specify(() => Date)
    public month: Date;

    @is() @scope(statistics)
    public sounds: number;
}

export class StatisticSoundsPerMonth {
    @is() @scope(statistics) @specify(() => SoundsPerSingleMonth)
    public soundsPerMonth: SoundsPerSingleMonth[];
}
