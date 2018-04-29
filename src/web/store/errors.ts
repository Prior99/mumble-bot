import { observable, computed, action } from "mobx";
import { bind } from "decko";
import { component } from "tsdi";

interface ApiError {
    message: string;
}

@component
export class ErrorStore {
    @observable public errors: ApiError[] = [];

    @bind @action
    public report(error: ApiError) {
        if (this.errors.find(other => other.message === error.message)) {
            return;
        }
        this.errors.push(error);
    }

    @bind @action
    public dismiss() {
        this.errors.pop();
    }

    @computed
    public get latestError() {
        return this.errors[this.errors.length - 1];
    }
}
