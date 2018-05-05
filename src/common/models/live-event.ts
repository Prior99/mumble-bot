import { is, DataType, oneOf, required, scope, specify } from "hyrest";
import { live } from "../scopes";
import { QueueItem } from "./queue-item";
import { CachedAudio } from "./";

type EventName = "init" |
    "cache add" |
    "cache remove" |
    "queue shift" |
    "queue push" |
    "queue clear";

export class LiveEvent {
    constructor(event: "cache add" | "cache remove", arg2: CachedAudio);
    constructor(event: "queue shift" | "queue push", arg2: QueueItem);
    constructor(event: "queue clear");
    constructor(event: "init", arg2: QueueItem[], arg3: CachedAudio[]);
    constructor(event: EventName, arg2?: QueueItem | CachedAudio | QueueItem[], arg3?: CachedAudio[]) {
        this.event = event;
        switch (event) {
            case "init":
                this.queue = arg2 as QueueItem[];
                this.cachedAudios = arg3;
                break;
            case "cache add":
            case "cache remove":
                this.cachedAudio = arg2 as CachedAudio;
                break;
            case "queue shift":
            case "queue push":
                this.queueItem = arg2 as QueueItem;
                break;
            case "queue clear":
            default:
                break;
        }
    }

    @is(DataType.str).validate(required, oneOf(
        "init",
        "cache add",
        "cache remove",
        "queue shift",
        "queue push",
        "queue clear",
    )) @scope(live)
    public event: EventName;

    @is() @scope(live)
    public queueItem?: QueueItem;

    @is() @scope(live)
    public cachedAudio?: CachedAudio;

    @is() @specify(() => QueueItem) @scope(live)
    public queue?: QueueItem[];

    @is() @specify(() => CachedAudio) @scope(live)
    public cachedAudios?: CachedAudio[];
}
