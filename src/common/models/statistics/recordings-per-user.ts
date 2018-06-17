import { is, scope, specify, uuid } from "hyrest";
import { statistics } from "../../scopes";
import { User } from "../user";

export class RecordingsPerSingleUser {
    @is().validate(uuid) @scope(statistics)
    public user: User;

    @is() @scope(statistics)
    public recordings: number;
}

export class StatisticRecordingsPerUser {
    @is() @scope(statistics) @specify(() => RecordingsPerSingleUser)
    public recordingsPerUser: RecordingsPerSingleUser[];
}
