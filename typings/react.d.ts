import * as React from "react";

declare module "react" {
    // See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/11508#issuecomment-256045682
    // and especially https://github.com/facebook/react/pull/9279#issuecomment-290140164.

    interface SyntheticTextAreaEvent extends SyntheticEvent<HTMLTextAreaElement> {
        target: EventTarget & HTMLTextAreaElement;
    }

    interface SyntheticInputEvent extends SyntheticEvent<HTMLInputElement> {
        target: EventTarget & HTMLInputElement;
    }
}
