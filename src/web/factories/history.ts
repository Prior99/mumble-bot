import { component, factory } from "tsdi";
import { createBrowserHistory, History } from "history";

@component
export class HistoryFactory {
    @factory({ name: "history" })
    public createHistory(): History {
        return createBrowserHistory();
    }
}
