import { is, scope, specify, uuid } from "hyrest";
import { statistics } from "../../scopes";
import { User } from "../user";

export class CreationsPerSingleUser {
    @is().validate(uuid) @scope(statistics)
    public user: User;

    @is() @scope(statistics)
    public creations: number;
}

export class StatisticCreationsPerUser {
    @is() @scope(statistics) @specify(() => CreationsPerSingleUser)
    public creationsPerUser: CreationsPerSingleUser[];
}
