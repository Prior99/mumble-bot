import { is, DataType, oneOf, required, scope } from "hyrest";
import { world } from "../scopes";
import { QueueItem } from "./";

export class WsEvent {
    @is(DataType.str).validate(required, oneOf(
        "audio cache add",
        "audio cache remove",
        "audio cache protect",
        "queue shift",
        "queue push",
        "queue clear",
    )) @scope(world)
    public event: "init" |
        "audio cache add" |
        "audio cache remove" |
        "audio cache protect" |
        "queue shift" |
        "queue push" |
        "queue clear";

    @is() @scope(world)
    public queueItem?: QueueItem;
}
